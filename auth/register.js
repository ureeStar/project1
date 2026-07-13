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

function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") || "").trim();
  const loginId = String(formData.get("loginId") || "").trim();
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");
  const email = String(formData.get("email") || "").trim();
  const favoriteMenu = String(formData.get("favoriteMenu") || "").trim();
  const errorEl = document.getElementById("registerError");

  errorEl.hidden = true;

  if (!name || !loginId || !password || !passwordConfirm) {
    errorEl.textContent = "필수 항목을 모두 입력해주세요.";
    errorEl.hidden = false;
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = "비밀번호가 서로 다릅니다.";
    errorEl.hidden = false;
    return;
  }

  const result = registerLocalUser({
    name,
    loginId,
    password,
    email,
    favoriteMenu,
  });

  if (!result.ok) {
    errorEl.textContent =
      result.reason === "duplicate-login-id"
        ? "이미 사용 중인 아이디입니다."
        : "회원가입 정보를 다시 확인해주세요.";
    errorEl.hidden = false;
    return;
  }

  saveCurrentUser({
    id: result.user.id,
    loginId: result.user.loginId,
    name: result.user.name,
    email: result.user.email,
    favoriteMenu: result.user.favoriteMenu,
    registeredAt: result.user.registeredAt,
  });

  processPendingAction();
  setPostLoginToast("가입이 완료되었습니다.");

  const redirectUrl = consumeRedirectAfterLogin(getFallbackRedirect());
  window.location.href = redirectUrl.includes("/auth/register.html") ? getFallbackRedirect() : redirectUrl;
}

function init() {
  initializeSharedCustomerUI();
  updateCartBadge();

  if (isLoggedIn()) {
    processPendingAction();
    window.location.href = consumeRedirectAfterLogin(getFallbackRedirect());
    return;
  }

  document.getElementById("registerForm").addEventListener("submit", handleRegister);
}

init();
