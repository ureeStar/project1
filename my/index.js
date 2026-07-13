const INFO_MESSAGES = {
  notice: "등록된 공지사항이 없습니다.",
  faq: "자주 묻는 질문 페이지를 준비 중입니다.",
  terms: "이용약관 및 정책 페이지를 준비 중입니다.",
};

function getDisplayStatusMeta(status) {
  const map = {
    주문접수: {
      label: "접수",
      className: "status-received",
    },
    준비중: {
      label: "제조중",
      className: "status-making",
    },
    완료: {
      label: "픽업완료",
      className: "status-picked",
    },
  };

  return (
    map[status] || {
      label: status,
      className: "status-received",
    }
  );
}

function getOrderSummary(order) {
  return order.items
    .map((item) => {
      const menu = getMenuById(item.menuId);
      const name = menu ? menu.name : "알 수 없는 메뉴";
      return `${name} ${item.quantity}개`;
    })
    .join(" · ");
}

function getOrderTotal(order) {
  return order.items.reduce((total, item) => {
    const menu = getMenuById(item.menuId);
    return menu ? total + menu.price * item.quantity : total;
  }, 0);
}

function renderCartSummary() {
  const totalCount = getCartTotalCount();
  const totalPrice = getCartTotalPrice(getMenuById);
  const orders = getOrders();
  const stampCount = Math.min(orders.length * 2, 12);
  const remainCount = Math.max(12 - stampCount, 0);

  document.getElementById("cartCount").textContent = `${totalCount}개`;
  document.getElementById("cartPrice").textContent = formatPrice(totalPrice);
  document.getElementById("stampCount").textContent = `${stampCount}개`;
  document.getElementById("stampMessage").textContent =
    remainCount > 0 ? `다음 리워드까지 ${remainCount}개` : "리워드 달성 완료";
}

function renderRecentOrder() {
  const recentOrderEl = document.getElementById("recentOrderCard");
  const orders = getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (orders.length === 0) {
    recentOrderEl.innerHTML = `
      <div class="empty-panel">
        아직 주문 내역이 없습니다. 메뉴를 둘러보고 첫 주문을 시작해보세요.
      </div>
    `;
    return;
  }

  const recentOrder = orders[0];
  const statusMeta = getDisplayStatusMeta(recentOrder.status);

  recentOrderEl.innerHTML = `
    <a class="recent-order-card" href="../orders/detail.html?id=${encodeURIComponent(recentOrder.id)}">
      <div class="recent-order-top">
        <div>
          <div class="recent-order-id">${recentOrder.id}</div>
          <div class="recent-order-date">${formatDate(recentOrder.createdAt)}</div>
        </div>
        <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
      </div>
      <div class="recent-order-summary">${getOrderSummary(recentOrder)}</div>
      <div class="recent-order-total">${formatPrice(getOrderTotal(recentOrder))}</div>
    </a>
  `;
}

function renderStamps() {
  const stampGridEl = document.getElementById("stampGrid");
  const stampCount = Math.min(getOrders().length * 2, 12);

  stampGridEl.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const isActive = index < stampCount;
    return `<span class="stamp-chip${isActive ? " is-active" : ""}">${isActive ? "●" : index + 1}</span>`;
  }).join("");
}

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

function renderProfile() {
  const user = getCurrentUser();
  const avatarEl = document.querySelector(".profile-avatar");
  const nameEl = document.querySelector(".profile-name");
  const descEl = document.querySelector(".profile-desc");
  const titleEl = document.querySelector(".welcome-title");
  const textEl = document.querySelector(".welcome-text");
  const authActionLabel = document.getElementById("authActionLabel");

  if (user) {
    const displayName = user.name || "회원";
    if (avatarEl) avatarEl.textContent = displayName.slice(0, 1).toUpperCase();
    if (nameEl) nameEl.textContent = `${displayName}님`;
    if (descEl) descEl.textContent = "오늘도 취향에 맞는 메뉴를 이어서 즐겨보세요.";
    if (titleEl) titleEl.textContent = `${displayName}님, 반가워요.`;
    if (textEl) textEl.textContent = "최근 주문, 장바구니, 찜 목록을 한 곳에서 확인할 수 있습니다.";
    if (authActionLabel) authActionLabel.textContent = "로그아웃";
    return;
  }

  if (avatarEl) avatarEl.textContent = "G";
  if (nameEl) nameEl.textContent = "게스트님";
  if (descEl) descEl.textContent = "로그인하면 찜 목록과 주문 흐름을 이어서 사용할 수 있어요.";
  if (authActionLabel) authActionLabel.textContent = "로그인";
}

function handleInfoClick(event) {
  const button = event.target.closest("[data-info]");
  if (!button) return;

  const message = INFO_MESSAGES[button.dataset.info];
  if (message) {
    window.alert(message);
  }
}

function handleAuthAction() {
  if (isLoggedIn()) {
    logoutCurrentUser();
    showAppToast("로그아웃되었습니다.");
    renderProfile();
    return;
  }

  setRedirectAfterLogin(window.location.href);
  window.location.href = "../auth/login.html";
}

function init() {
  initializeSharedCustomerUI();
  renderProfile();
  renderCartSummary();
  renderRecentOrder();
  renderStamps();
  updateCartBadge();

  document.querySelectorAll("[data-info]").forEach((button) => {
    button.addEventListener("click", handleInfoClick);
  });

  const authActionBtn = document.getElementById("authActionBtn");
  if (authActionBtn) {
    authActionBtn.addEventListener("click", handleAuthAction);
  }
}

init();
