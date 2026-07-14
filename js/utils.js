// ===== Shared formatting =====
function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ko-KR")}원`;
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

// ===== Shared storage keys =====
const CART_STORAGE_KEY = "cafe-app:cart";
const CART_COMPAT_STORAGE_KEY = "cartItems";
const CURRENT_USER_KEY = "currentUser";
const REGISTERED_USERS_KEY = "registeredUsers";
const WISHLIST_STORAGE_KEY = "wishlistItems";
const GUEST_SCOPE_KEY = "cafe-app:guest-scope-id";
const PENDING_ACTION_KEY = "pendingAction";
const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const POST_LOGIN_TOAST_KEY = "postLoginToast";

let cartCache = null;
let wishlistCache = null;

function safeParseJSON(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// ===== Cart utilities =====
function normalizeCartItemOptions(options = {}) {
  return {
    temperature: options.temperature || null,
    size: options.size || null,
  };
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.menuId)
    .map((item) => {
      const options = normalizeCartItemOptions(item);
      return {
        menuId: item.menuId,
        quantity: Math.max(1, Number(item.quantity) || 1),
        temperature: options.temperature,
        size: options.size,
      };
    });
}

function getCartItemKey(menuId, options = {}) {
  const normalized = normalizeCartItemOptions(options);
  return [
    menuId,
    normalized.temperature || "none",
    normalized.size || "none",
  ].join("::");
}

function getCurrentUser() {
  const user = safeParseJSON(localStorage.getItem(CURRENT_USER_KEY), null);
  return user && typeof user === "object" ? user : null;
}

function getGuestScopeId() {
  let scopeId = localStorage.getItem(GUEST_SCOPE_KEY);
  if (!scopeId) {
    scopeId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_SCOPE_KEY, scopeId);
  }
  return scopeId;
}

function getCartScopeId() {
  const user = getCurrentUser();
  return user?.id || getGuestScopeId();
}

function readLegacyCartItems() {
  const raw = localStorage.getItem(CART_STORAGE_KEY) || localStorage.getItem(CART_COMPAT_STORAGE_KEY);
  return normalizeCartItems(safeParseJSON(raw, []));
}

function clearLegacyCartStorage() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(CART_COMPAT_STORAGE_KEY);
}

function mapDbCartItem(row) {
  return {
    menuId: row.menu_id,
    quantity: Number(row.quantity) || 1,
    temperature: row.temperature || null,
    size: row.size || null,
  };
}

function persistCartItems(scopeId, cartItems) {
  const normalizedItems = normalizeCartItems(cartItems);
  supabaseRequestSync("DELETE", "cart_items", `user_id=eq.${encodeURIComponent(scopeId)}`);

  normalizedItems.forEach((item) => {
    supabaseRequestSync("POST", "cart_items", "", {
      user_id: scopeId,
      menu_id: item.menuId,
      quantity: item.quantity,
      temperature: item.temperature || null,
      size: item.size || null,
    });
  });

  cartCache = {
    scopeId,
    items: normalizedItems.map((item) => ({ ...item })),
  };

  return cartCache.items.map((item) => ({ ...item }));
}

function loadCartFromDb() {
  const scopeId = getCartScopeId();
  if (cartCache && cartCache.scopeId === scopeId) {
    return cartCache.items.map((item) => ({ ...item }));
  }

  try {
    const rows = supabaseRequestSync(
      "GET",
      "cart_items",
      `select=*&user_id=eq.${encodeURIComponent(scopeId)}&order=created_at.asc`
    );
    const dbItems = normalizeCartItems(rows.map(mapDbCartItem));

    if (!dbItems.length) {
      const legacyItems = readLegacyCartItems();
      if (legacyItems.length) {
        const migratedItems = persistCartItems(scopeId, legacyItems);
        clearLegacyCartStorage();
        return migratedItems;
      }
    }

    cartCache = {
      scopeId,
      items: dbItems,
    };
    return dbItems.map((item) => ({ ...item }));
  } catch {
    const legacyItems = readLegacyCartItems();
    cartCache = {
      scopeId,
      items: legacyItems,
    };
    return legacyItems.map((item) => ({ ...item }));
  }
}

function getCart() {
  return loadCartFromDb();
}

function saveCart(cartItems) {
  const scopeId = getCartScopeId();

  try {
    return persistCartItems(scopeId, cartItems);
  } catch {
    const normalizedItems = normalizeCartItems(cartItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
    localStorage.setItem(CART_COMPAT_STORAGE_KEY, JSON.stringify(normalizedItems));
    cartCache = {
      scopeId,
      items: normalizedItems,
    };
    return normalizedItems.map((item) => ({ ...item }));
  }
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

  return saveCart(cartItems);
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

  return saveCart(cartItems);
}

function removeFromCart(menuId, options = {}) {
  const itemKey = getCartItemKey(menuId, options);
  const cartItems = getCart().filter((item) => getCartItemKey(item.menuId, item) !== itemKey);
  return saveCart(cartItems);
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

function mergeGuestCartIntoUser(userId) {
  if (!userId) return;

  const guestScopeId = localStorage.getItem(GUEST_SCOPE_KEY);
  if (!guestScopeId || guestScopeId === userId) return;

  try {
    const guestRows = supabaseRequestSync(
      "GET",
      "cart_items",
      `select=*&user_id=eq.${encodeURIComponent(guestScopeId)}&order=created_at.asc`
    );
    const userRows = supabaseRequestSync(
      "GET",
      "cart_items",
      `select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.asc`
    );

    const mergedMap = new Map();
    [...userRows.map(mapDbCartItem), ...guestRows.map(mapDbCartItem)].forEach((item) => {
      const key = getCartItemKey(item.menuId, item);
      const existing = mergedMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        mergedMap.set(key, { ...item });
      }
    });

    if (mergedMap.size) {
      persistCartItems(userId, [...mergedMap.values()]);
      supabaseRequestSync("DELETE", "cart_items", `user_id=eq.${encodeURIComponent(guestScopeId)}`);
    }
  } catch {
    const legacyItems = readLegacyCartItems();
    if (legacyItems.length) {
      saveCart(legacyItems);
      clearLegacyCartStorage();
    }
  }
}

// ===== Auth utilities =====
function isLoggedIn() {
  return Boolean(getCurrentUser());
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  mergeGuestCartIntoUser(user?.id);
  cartCache = null;
  wishlistCache = null;
  return user;
}

function logoutCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  cartCache = null;
  wishlistCache = null;
}

function findUserByLoginId(loginId) {
  const dbUsers =
    typeof window.getRegisteredUsers === "function"
      ? window.getRegisteredUsers()
      : [];
  const fallbackUsers = safeParseJSON(localStorage.getItem(REGISTERED_USERS_KEY), []);
  return [...dbUsers, ...fallbackUsers].find((user) => user.loginId === loginId) || null;
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

  const payload = {
    id: `user-${Date.now()}`,
    login_id: loginId,
    password,
    name,
    email,
    favorite_menu: favoriteMenu,
  };

  try {
    const rows = supabaseRequestSync("POST", "registered_users", "", payload);
    if (typeof refreshRegisteredUsersCache === "function") {
      refreshRegisteredUsersCache();
    }
    localStorage.removeItem(REGISTERED_USERS_KEY);

    const createdUser = rows[0] || {
      ...payload,
      registered_at: new Date().toISOString(),
    };

    return {
      ok: true,
      user: {
        id: createdUser.id,
        loginId: createdUser.login_id,
        password: createdUser.password,
        name: createdUser.name,
        email: createdUser.email || "",
        favoriteMenu: createdUser.favorite_menu || "",
        registeredAt: createdUser.registered_at,
      },
    };
  } catch {
    const fallbackUsers = safeParseJSON(localStorage.getItem(REGISTERED_USERS_KEY), []);
    const nextUser = {
      id: payload.id,
      loginId,
      password,
      name,
      email,
      favoriteMenu,
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...fallbackUsers, nextUser]));
    return {
      ok: true,
      user: nextUser,
    };
  }
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

// ===== Wishlist utilities =====
function normalizeWishlistItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && item.menuId)
    .map((item) => ({
      menuId: item.menuId,
      name: item.name || "",
      price: Number(item.price) || 0,
      image: item.image || "",
    }));
}

function buildWishlistItem(menu) {
  return {
    menuId: menu.id,
    name: menu.name,
    price: Number(menu.price) || 0,
    image: menu.image || "",
  };
}

function getWishlist() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    wishlistCache = {
      userId: null,
      items: [],
    };
    return [];
  }

  if (wishlistCache && wishlistCache.userId === currentUser.id) {
    return wishlistCache.items.map((item) => ({ ...item }));
  }

  try {
    const rows = supabaseRequestSync(
      "GET",
      "wishlist_items",
      `select=menu_id,menus(id,name,price,image)&user_id=eq.${encodeURIComponent(currentUser.id)}&order=created_at.asc`
    );

    let items = rows.map((row) => {
      const menu = Array.isArray(row.menus) ? row.menus[0] : row.menus;
      if (menu) {
        return {
          menuId: menu.id,
          name: menu.name || "",
          price: Number(menu.price) || 0,
          image: menu.image || "",
        };
      }

      if (typeof getMenuById === "function") {
        const fallbackMenu = getMenuById(row.menu_id);
        return fallbackMenu ? buildWishlistItem(fallbackMenu) : null;
      }

      return null;
    }).filter(Boolean);

    if (!items.length) {
      const legacyStore = safeParseJSON(localStorage.getItem(WISHLIST_STORAGE_KEY), {});
      const legacyItems = Array.isArray(legacyStore)
        ? normalizeWishlistItems(legacyStore)
        : normalizeWishlistItems(legacyStore?.[currentUser.id]);

      if (legacyItems.length) {
        items = saveWishlist(legacyItems);
        const nextLegacyStore =
          legacyStore && !Array.isArray(legacyStore) && typeof legacyStore === "object"
            ? { ...legacyStore }
            : {};
        delete nextLegacyStore[currentUser.id];
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextLegacyStore));
        return items;
      }
    }

    wishlistCache = {
      userId: currentUser.id,
      items: normalizeWishlistItems(items),
    };
    return wishlistCache.items.map((item) => ({ ...item }));
  } catch {
    const legacyStore = safeParseJSON(localStorage.getItem(WISHLIST_STORAGE_KEY), {});
    const legacyItems = Array.isArray(legacyStore)
      ? normalizeWishlistItems(legacyStore)
      : normalizeWishlistItems(legacyStore?.[currentUser.id]);
    wishlistCache = {
      userId: currentUser.id,
      items: legacyItems,
    };
    return legacyItems.map((item) => ({ ...item }));
  }
}

function saveWishlist(items) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return [];
  }

  const normalizedItems = normalizeWishlistItems(items);

  try {
    supabaseRequestSync("DELETE", "wishlist_items", `user_id=eq.${encodeURIComponent(currentUser.id)}`);
    normalizedItems.forEach((item) => {
      supabaseRequestSync("POST", "wishlist_items", "", {
        user_id: currentUser.id,
        menu_id: item.menuId,
      });
    });
  } catch {
    const legacyStore = safeParseJSON(localStorage.getItem(WISHLIST_STORAGE_KEY), {});
    const nextLegacyStore =
      legacyStore && !Array.isArray(legacyStore) && typeof legacyStore === "object"
        ? { ...legacyStore }
        : {};
    nextLegacyStore[currentUser.id] = normalizedItems;
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(nextLegacyStore));
  }

  wishlistCache = {
    userId: currentUser.id,
    items: normalizedItems,
  };

  return normalizedItems.map((item) => ({ ...item }));
}

function isWishlisted(menuId) {
  return getWishlist().some((item) => item.menuId === menuId);
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

// ===== Shared UX helpers =====
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
  const path = window.location.pathname;
  const markers = ["/menus/", "/basket/", "/orders/", "/my/", "/wishlist/", "/auth/", "/admin/", "/index.html"];
  let cutIndex = path.length;

  markers.forEach((marker) => {
    const index = path.indexOf(marker);
    if (index !== -1) {
      cutIndex = Math.min(cutIndex, index);
    }
  });

  if (cutIndex !== path.length) {
    return path.slice(0, cutIndex) || "";
  }

  if (path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

function getCustomerLoginUrl() {
  return `${getCustomerAppBasePath()}/auth/login.html`;
}

function getCustomerRegisterUrl() {
  return `${getCustomerAppBasePath()}/auth/register.html`;
}

function getCustomerHomeUrl() {
  return `${getCustomerAppBasePath()}/index.html`;
}

function getCustomerMyUrl() {
  return `${getCustomerAppBasePath()}/my/index.html`;
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
      showAppToast("로그아웃 되었어요.");
      window.setTimeout(() => {
        window.location.href = getCustomerHomeUrl();
      }, 180);
    };
  });
}

function initializeSharedCustomerUI() {
  renderHeaderAuth();
  showPendingToast();
}
