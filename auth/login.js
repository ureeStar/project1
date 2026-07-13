function updateCartBadge() {
  const badgeEls = document.querySelectorAll("[data-cart-badge]");
  if (!badgeEls.length) return;

  const count = getCartTotalCount();
  badgeEls.forEach((badgeEl) => {
    if (count > 0) {
      badgeEl.textContent = count > 99 ? "99+" : String(count);
      badgeEl.hidden = false;
    } else {
      badgeEl.hidden = true;
    }
  });
}

function getFallbackRedirect() {
  return "../my/index.html";
}

function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const loginId = String(formData.get("loginId") || "").trim();
  const password = String(formData.get("password") || "");
  const errorEl = document.getElementById("loginError");

  errorEl.hidden = true;

  if (!loginId || !password) {
    errorEl.textContent = "아이디와 비밀번호를 입력해주세요.";
    errorEl.hidden = false;
    return;
  }

  const result = authenticateLocalUser(loginId, password);
  if (!result.ok) {
    errorEl.textContent =
      result.reason === "wrong-password"
        ? "비밀번호가 일치하지 않습니다."
        : "등록된 아이디를 찾을 수 없습니다.";
    errorEl.hidden = false;
    return;
  }

  saveCurrentUser({
    id: result.user.id,
    loginId: result.user.loginId,
    name: result.user.name,
    email: result.user.email,
    favoriteMenu: result.user.favoriteMenu,
    loggedInAt: new Date().toISOString(),
  });

  processPendingAction();
  setPostLoginToast(`${result.user.name}님, 다시 오셨네요.`);

  const redirectUrl = consumeRedirectAfterLogin(getFallbackRedirect());
  window.location.href = redirectUrl.includes("/auth/login.html") ? getFallbackRedirect() : redirectUrl;
}

function init() {
  initializeSharedCustomerUI();
  updateCartBadge();

  if (isLoggedIn()) {
    processPendingAction();
    window.location.href = consumeRedirectAfterLogin(getFallbackRedirect());
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
}

init();
