const content = document.getElementById("content");
const backLink = document.getElementById("backLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

function getStatusMeta(status) {
  if (status === "완료") {
    return {
      className: "status-done",
      label: "완료",
      description: "고객 수령까지 마무리된 상태입니다.",
    };
  }

  if (status === "준비중") {
    return {
      className: "status-preparing",
      label: "준비중",
      description: "바리스타가 제조를 진행 중입니다.",
    };
  }

  return {
    className: "status-received",
    label: "주문접수",
    description: "결제 완료 후 제조 대기 상태입니다.",
  };
}

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없습니다.</h1>
      <p>삭제되었거나 잘못된 경로로 접근했습니다.</p>
    </section>
  `;
  backLink.style.display = "none";
}

function renderStatusActions(order) {
  return ORDER_STATUSES.map((status, index) => {
    const meta = getStatusMeta(status);
    return `
      <button
        class="status-step ${status === order.status ? "active" : ""}"
        type="button"
        data-action="set-status"
        data-status="${status}"
      >
        <div class="status-step-copy">
          <span class="status-step-label">${meta.label}</span>
          <span class="status-step-description">${meta.description}</span>
        </div>
        <span class="status-step-mark">${index + 1}</span>
      </button>
    `;
  }).join("");
}

function renderEdit(order) {
  backLink.href = `./detail.html?id=${encodeURIComponent(order.id)}`;
  const statusMeta = getStatusMeta(order.status);

  content.innerHTML = `
    <section class="edit-card">
      <div class="edit-top">
        <div>
          <p class="eyebrow">Order Status</p>
          <div class="order-id">${order.id}</div>
          <p class="order-date">${formatDate(order.createdAt)}</p>
          <p class="order-summary">${getOrderSummaryText(order)} · ${formatPrice(getOrderTotalPrice(order))}</p>
        </div>
        <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
      </div>

      <div class="status-current">
        <span>현재 상태</span>
        <strong>${statusMeta.description}</strong>
      </div>

      <div>
        <h2 class="section-title">상태 변경</h2>
        <div class="status-actions" id="statusActions">${renderStatusActions(order)}</div>
      </div>

      <div class="order-note">
        <span>운영 참고</span>
        <strong>${order.status === "완료" ? "완료 주문은 필요할 때만 이전 상태로 되돌리세요." : "상태 버튼을 누르면 즉시 주문 상태가 반영됩니다."}</strong>
      </div>
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
