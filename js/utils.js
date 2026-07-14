// ===== 포맷 유틸리티 =====
function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function getStatusClass(status) {
  if (status === "완료") return "status-done";
  if (status === "준비중") return "status-preparing";
  return "status-received";
}

// ===== 장바구니 유틸리티 (localStorage 기반) =====
const CART_STORAGE_KEY = "cafe-app:cart";
const CART_COMPAT_STORAGE_KEY = "cartItems";

function normalizeCartItemOptions(options = {}) {
  return {
    temperature: options.temperature || null,
    size: options.size || null,
  };
}

function getCartItemKey(menuId, options = {}) {
  const normalized = normalizeCartItemOptions(options);
  return [
    menuId,
    normalized.temperature || "none",
    normalized.size || "none",
  ].join("::");
}

function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(CART_COMPAT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      const options = normalizeCartItemOptions(item);
      return {
        ...item,
        temperature: options.temperature,
        size: options.size,
      };
    });
  } catch {
    return [];
  }
}

function saveCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  localStorage.setItem(CART_COMPAT_STORAGE_KEY, JSON.stringify(cartItems));
}

function addToCart(menuId, quantity = 1, options = {}) {
  const cartItems = getCart();
  const nextOptions = normalizeCartItemOptions(options);
  const itemKey = getCartItemKey(menuId, nextOptions);
  const existing = cartItems.find((item) => getCartItemKey(item.menuId, item) === itemKey);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({
      menuId,
      quantity,
      temperature: nextOptions.temperature,
      size: nextOptions.size,
    });
  }

  saveCart(cartItems);
  return cartItems;
}

function updateCartItemQuantity(menuId, quantity, options = {}) {
  let cartItems = getCart();
  const itemKey = getCartItemKey(menuId, options);

  if (quantity <= 0) {
    cartItems = cartItems.filter((item) => getCartItemKey(item.menuId, item) !== itemKey);
  } else {
    const existing = cartItems.find((item) => getCartItemKey(item.menuId, item) === itemKey);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  saveCart(cartItems);
  return cartItems;
}

function removeFromCart(menuId, options = {}) {
  const itemKey = getCartItemKey(menuId, options);
  const cartItems = getCart().filter((item) => getCartItemKey(item.menuId, item) !== itemKey);
  saveCart(cartItems);
  return cartItems;
}

function clearCart() {
  saveCart([]);
}

function getCartTotalCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotalPrice(getMenuByIdFn) {
  return getCart().reduce((total, item) => {
    const menu = getMenuByIdFn(item.menuId);
    if (!menu) return total;
    return total + menu.price * item.quantity;
  }, 0);
}

// ===== Auth / Wishlist utilities (localStorage based) =====
const CURRENT_USER_KEY = "currentUser";
const REGISTERED_USERS_KEY = "registeredUsers";
const WISHLIST_STORAGE_KEY = "wishlistItems";
const PENDING_ACTION_KEY = "pendingAction";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const POST_LOGIN_TOAST_KEY = "postLoginToast";

function safeParseJSON(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function getCurrentUser() {
  const user = safeParseJSON(localStorage.getItem(CURRENT_USER_KEY), null);
  return user && typeof user === "object" ? user : null;
}

function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

function logoutCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getRegisteredUsers() {
  const users = safeParseJSON(localStorage.getItem(REGISTERED_USERS_KEY), []);
  return Array.isArray(users) ? users : [];
}

function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  return users;
}

function findUserByLoginId(loginId) {
  return getRegisteredUsers().find((user) => user.loginId === loginId) || null;
}

function registerLocalUser(userInput) {
  const loginId = String(userInput.loginId || "").trim();
  const password = String(userInput.password || "");
  const name = String(userInput.name || "").trim();
  const email = String(userInput.email || "").trim();
  const favoriteMenu = String(userInput.favoriteMenu || "").trim();

  if (!loginId || !password || !name) {
    return { ok: false, reason: "missing-fields" };
  }

  if (findUserByLoginId(loginId)) {
    return { ok: false, reason: "duplicate-login-id" };
  }

  const nextUser = {
    id: `user-${Date.now()}`,
    loginId,
    password,
    name,
    email,
    favoriteMenu,
    registeredAt: new Date().toISOString(),
  };

  saveRegisteredUsers([...getRegisteredUsers(), nextUser]);

  return {
    ok: true,
    user: nextUser,
  };
}

function authenticateLocalUser(loginId, password) {
  const account = findUserByLoginId(String(loginId || "").trim());
  if (!account) {
    return { ok: false, reason: "not-found" };
  }

  if (account.password !== String(password || "")) {
    return { ok: false, reason: "wrong-password" };
  }

  return {
    ok: true,
    user: account,
  };
}

function getWishlistScopeKey() {
  const currentUser = getCurrentUser();
  return currentUser?.id || "guest";
}

function normalizeWishlistItems(items) {
  return Array.isArray(items) ? items : [];
}

function getWishlistStore() {
  const parsed = safeParseJSON(localStorage.getItem(WISHLIST_STORAGE_KEY), {});

  if (Array.isArray(parsed)) {
    return {
      guest: normalizeWishlistItems(parsed),
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([scopeKey, items]) => [scopeKey, normalizeWishlistItems(items)])
  );
}

function saveWishlistStore(store) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(store));
  return store;
}

function getWishlist() {
  const store = getWishlistStore();
  return normalizeWishlistItems(store[getWishlistScopeKey()]);
}

function saveWishlist(items) {
  const store = getWishlistStore();
  const scopeKey = getWishlistScopeKey();
  store[scopeKey] = normalizeWishlistItems(items);
  saveWishlistStore(store);
  return items;
}

function isWishlisted(menuId) {
  return getWishlist().some((item) => item.menuId === menuId);
}

function buildWishlistItem(menu) {
  return {
    menuId: menu.id,
    name: menu.name,
    price: Number(menu.price) || 0,
    image: menu.image || "",
  };
}

function addWishlistItem(menu) {
  if (!menu || isWishlisted(menu.id)) return getWishlist();
  return saveWishlist([...getWishlist(), buildWishlistItem(menu)]);
}

function removeWishlistItem(menuId) {
  return saveWishlist(getWishlist().filter((item) => item.menuId !== menuId));
}

function toggleWishlistItem(menu) {
  if (!menu) return { wishlisted: false, items: getWishlist() };

  if (isWishlisted(menu.id)) {
    return {
      wishlisted: false,
      items: removeWishlistItem(menu.id),
    };
  }

  return {
    wishlisted: true,
    items: addWishlistItem(menu),
  };
}

function setPendingAction(action) {
  localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
}

function getPendingAction() {
  return safeParseJSON(localStorage.getItem(PENDING_ACTION_KEY), null);
}

function clearPendingAction() {
  localStorage.removeItem(PENDING_ACTION_KEY);
}

function setRedirectAfterLogin(url = window.location.href) {
  localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, url);
}

function consumeRedirectAfterLogin(fallbackUrl = "../index.html") {
  const redirectUrl = localStorage.getItem(REDIRECT_AFTER_LOGIN_KEY) || fallbackUrl;
  localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
  return redirectUrl;
}

function getCustomerAppBasePath() {
  const scriptEl = [...document.scripts].find((script) => script.src.includes("/js/utils.js"));
  if (!scriptEl) {
    return "";
  }

  const scriptUrl = new URL(scriptEl.src, window.location.href);
  return scriptUrl.pathname.replace(/\/js\/utils\.js$/, "");
}

function getCustomerUrl(path) {
  const basePath = getCustomerAppBasePath();
  return `${basePath}/${path}`.replace(/\/{2,}/g, "/");
}

function getCustomerLoginUrl() {
  return getCustomerUrl("auth/login.html");
}

function getCustomerRegisterUrl() {
  return getCustomerUrl("auth/register.html");
}

function getCustomerHomeUrl() {
  return getCustomerUrl("index.html");
}

function getCustomerMyUrl() {
  return getCustomerUrl("my/index.html");
}

function setPostLoginToast(message) {
  localStorage.setItem(POST_LOGIN_TOAST_KEY, message);
}

function consumePostLoginToast() {
  const message = localStorage.getItem(POST_LOGIN_TOAST_KEY);
  localStorage.removeItem(POST_LOGIN_TOAST_KEY);
  return message;
}

function showAppToast(message) {
  if (!message) return;

  let toastEl = document.getElementById("appToast");
  if (!toastEl) {
    toastEl = document.createElement("p");
    toastEl.id = "appToast";
    toastEl.className = "app-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.classList.add("is-visible");

  window.clearTimeout(showAppToast.timer);
  showAppToast.timer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2200);
}

function showPendingToast() {
  const message = consumePostLoginToast();
  if (message) {
    window.setTimeout(() => showAppToast(message), 200);
  }
}

function showLoginRequiredModal({ title, message, pendingAction } = {}) {
  const previousActiveElement = document.activeElement;
  let modalEl = document.getElementById("loginRequiredModal");

  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "loginRequiredModal";
    modalEl.className = "auth-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-labelledby", "loginRequiredTitle");
    modalEl.innerHTML = `
      <div class="auth-modal-backdrop" data-auth-modal-close></div>
      <section class="auth-modal-panel" tabindex="-1">
        <p class="auth-modal-kicker">Mellow Yard</p>
        <h2 id="loginRequiredTitle"></h2>
        <p id="loginRequiredMessage"></p>
        <div class="auth-modal-actions">
          <button class="secondary-button" type="button" data-auth-modal-close>취소</button>
          <button class="primary-button" type="button" data-auth-login>로그인하기</button>
        </div>
      </section>
    `;
    document.body.appendChild(modalEl);
  }

  modalEl.querySelector("#loginRequiredTitle").textContent = title || "로그인이 필요해요";
  modalEl.querySelector("#loginRequiredMessage").textContent =
    message || "로그인 후 이용할 수 있습니다.";

  const closeModal = () => {
    modalEl.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", handleKeydown);
    if (previousActiveElement && typeof previousActiveElement.focus === "function") {
      previousActiveElement.focus();
    }
  };

  const goLogin = () => {
    if (pendingAction) {
      setPendingAction(pendingAction);
    }
    setRedirectAfterLogin(window.location.href);
    window.location.href = getCustomerLoginUrl();
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }

    if (event.key === "Tab") {
      const focusableEls = [...modalEl.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
        .filter((item) => !item.disabled && item.offsetParent !== null);
      if (!focusableEls.length) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }
  };

  modalEl.querySelectorAll("[data-auth-modal-close]").forEach((button) => {
    button.onclick = closeModal;
  });
  modalEl.querySelector("[data-auth-login]").onclick = goLogin;

  modalEl.classList.add("is-open");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", handleKeydown);
  modalEl.querySelector(".auth-modal-panel").focus();
}

function processPendingAction() {
  const action = getPendingAction();
  if (!action) {
    return false;
  }

  if (action.type !== "wishlist" || !action.menuId || typeof getMenuById !== "function") {
    clearPendingAction();
    return false;
  }

  const menu = getMenuById(action.menuId);
  if (menu) {
    addWishlistItem(menu);
    setPostLoginToast("찜 목록에 저장했어요.");
  }

  clearPendingAction();
  return true;
}

function renderHeaderAuth() {
  const headers = document.querySelectorAll(".site-header");
  if (!headers.length) return;

  const user = getCurrentUser();
  const loginUrl = getCustomerLoginUrl();
  const registerUrl = getCustomerRegisterUrl();
  const myUrl = getCustomerMyUrl();

  headers.forEach((header) => {
    let authEl = header.querySelector("[data-header-auth]");

    if (!authEl) {
      authEl = document.createElement("div");
      authEl.className = "header-auth";
      authEl.setAttribute("data-header-auth", "true");

      const cartLink = header.querySelector(".cart-link");
      if (cartLink) {
        cartLink.insertAdjacentElement("afterend", authEl);
      } else {
        header.appendChild(authEl);
      }
    }

    if (user) {
      const safeName = String(user.name || "Member").replace(/"/g, "&quot;");
      authEl.innerHTML = `
        <a class="header-auth-user" href="${myUrl}" title="${safeName}">${safeName}</a>
        <button class="header-auth-link" type="button" data-auth-logout>Logout</button>
      `;
    } else {
      authEl.innerHTML = `
        <a class="header-auth-link" href="${loginUrl}">Login</a>
        <a class="header-auth-link header-auth-link-primary" href="${registerUrl}">Sign up</a>
      `;
    }
  });

  document.querySelectorAll("[data-auth-logout]").forEach((button) => {
    button.onclick = () => {
      logoutCurrentUser();
      clearPendingAction();
      localStorage.removeItem(REDIRECT_AFTER_LOGIN_KEY);
      window.setTimeout(() => {
        window.location.href = getCustomerHomeUrl();
      }, 180);
      showAppToast("로그아웃되었습니다.");
    };
  });
}

function initializeSharedCustomerUI() {
  renderHeaderAuth();
  showPendingToast();
}
