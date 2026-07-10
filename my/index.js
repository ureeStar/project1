const INFO_MESSAGES = {
  notice: "등록된 공지사항이 없습니다.",
  faq: "자주 묻는 질문 페이지는 준비 중입니다.",
  terms: "이용약관 및 정책 페이지는 준비 중입니다.",
};

// ===== 장바구니 요약 =====
function renderCartSummary() {
  const totalCount = getCartTotalCount();
  const totalPrice = getCartTotalPrice(getMenuById);

  document.getElementById("cartCount").textContent = `${totalCount}개`;
  document.getElementById("cartPrice").textContent = formatPrice(totalPrice);
}

// ===== 장바구니 배지 =====
function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

// ===== 고객 지원 항목 =====
function handleInfoClick(event) {
  const button = event.target.closest("[data-info]");
  if (!button) return;

  const message = INFO_MESSAGES[button.dataset.info];
  if (message) {
    window.alert(message);
  }
}

function init() {
  renderCartSummary();
  updateCartBadge();
  document.querySelectorAll("[data-info]").forEach((button) => {
    button.addEventListener("click", handleInfoClick);
  });
}

init();
