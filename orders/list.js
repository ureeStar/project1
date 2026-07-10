// ===== 초기화 =====
function init() {
  renderOrderList();
  updateCartBadge();
}

// ===== 주문 목록 렌더링 =====
function renderOrderList() {
  const listEl = document.getElementById("orderList");
  const orders = getOrders().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (orders.length === 0) {
    listEl.innerHTML = `<p class="empty-state">주문 내역이 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = orders
    .map(
      (order) => `
        <a class="order-card glass" href="detail.html?id=${encodeURIComponent(order.id)}">
          <div class="order-card-top">
            <span class="order-card-id">${order.id}</span>
            <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
          </div>
          <span class="order-card-date">${formatDate(order.createdAt)}</span>
          <span class="order-card-summary">${getOrderSummaryText(order)}</span>
          <div class="order-card-bottom">
            <span class="order-card-total">${formatPrice(getOrderTotalPrice(order))}</span>
          </div>
        </a>
      `
    )
    .join("");
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

init();
