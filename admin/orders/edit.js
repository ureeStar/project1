const content = document.getElementById("content");
const backLink = document.getElementById("backLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  backLink.style.display = "none";
}

function renderStatusActions(order) {
  return ORDER_STATUSES.map(
    (status) => `
      <button
        class="status-button ${status === order.status ? "active" : ""}"
        type="button"
        data-action="set-status"
        data-status="${status}"
      >
        ${status}
      </button>
    `
  ).join("");
}

function renderEdit(order) {
  backLink.href = `./detail.html?id=${encodeURIComponent(order.id)}`;

  content.innerHTML = `
    <section class="edit-card">
      <div class="edit-top">
        <div>
          <p class="eyebrow">Order Status</p>
          <div class="order-id">${order.id}</div>
        </div>
        <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
      </div>
      <p class="order-date">${formatDate(order.createdAt)}</p>
      <p class="order-summary">${getOrderSummaryText(order)} · ${formatPrice(getOrderTotalPrice(order))}</p>

      <h2 class="section-title">상태 변경</h2>
      <div class="status-actions" id="statusActions">${renderStatusActions(order)}</div>
    </section>
  `;

  document.getElementById("statusActions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='set-status']");
    if (!button) return;

    const { status } = button.dataset;
    if (status === order.status) return;

    updateOrderStatus(order.id, status);
    renderEdit(getOrderById(order.id));
  });
}

const order = orderId ? getOrderById(orderId) : null;

if (!order) {
  renderEmpty();
} else {
  renderEdit(order);
}
