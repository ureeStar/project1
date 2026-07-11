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
  const badgeEl = document.getElementById("cartBadge");
  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

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
  renderRecentOrder();
  renderStamps();
  updateCartBadge();

  document.querySelectorAll("[data-info]").forEach((button) => {
    button.addEventListener("click", handleInfoClick);
  });
}

init();
