function renderSummary() {
  const orders = getOrders();
  const menus = getAllMenus();

  const pendingCount = orders.filter((order) => order.status !== "완료").length;
  const totalRevenue = orders.reduce((total, order) => total + getOrderTotalPrice(order), 0);
  const soldOutCount = menus.filter((menu) => menu.soldOut).length;

  document.getElementById("totalOrders").textContent = orders.length;
  document.getElementById("pendingOrders").textContent = pendingCount;
  document.getElementById("totalRevenue").textContent = formatPrice(totalRevenue);
  document.getElementById("soldOutMenus").textContent = soldOutCount;
}

function renderRecentOrders() {
  const listEl = document.getElementById("recentOrders");
  const orders = getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (!orders.length) {
    listEl.innerHTML = `<div class="empty-state">아직 주문이 없어요.</div>`;
    return;
  }

  listEl.innerHTML = orders
    .map(
      (order) => `
        <a class="order-card" href="./orders/detail.html?id=${encodeURIComponent(order.id)}">
          <div class="order-card-top">
            <span class="order-card-id">${order.id}</span>
            <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
          </div>
          <span class="order-card-date">${formatDate(order.createdAt)}</span>
          <div class="order-card-footer">
            <span>${getOrderSummaryText(order)}</span>
            <span class="order-card-total">${formatPrice(getOrderTotalPrice(order))}</span>
          </div>
        </a>
      `
    )
    .join("");
}

function initializePage() {
  renderSummary();
  renderRecentOrders();
}

initializePage();
