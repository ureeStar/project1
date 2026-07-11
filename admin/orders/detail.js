const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

function getStatusMeta(status) {
  if (status === "완료") {
    return {
      className: "status-done",
      label: "완료",
      description: "고객 수령까지 끝난 주문입니다.",
    };
  }

  if (status === "준비중") {
    return {
      className: "status-preparing",
      label: "준비중",
      description: "바에서 제조를 진행 중입니다.",
    };
  }

  return {
    className: "status-received",
    label: "주문접수",
    description: "제조를 기다리는 신규 주문입니다.",
  };
}

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없습니다.</h1>
      <p>삭제되었거나 잘못된 경로로 접근했습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

function renderDetail(order) {
  editLink.href = `./edit.html?id=${encodeURIComponent(order.id)}`;
  const statusMeta = getStatusMeta(order.status);

  const itemRows = order.items
    .map((item) => {
      const menu = getMenuById(item.menuId);
      const name = menu ? menu.name : "알 수 없는 메뉴";
      const subtotal = menu ? menu.price * item.quantity : 0;
      return `
        <div class="item-row">
          <div>
            <div class="item-name">${name}</div>
            <div class="item-qty">${item.quantity}개</div>
          </div>
          <span class="item-subtotal">${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  content.innerHTML = `
    <section class="detail-card">
      <div class="detail-hero">
        <div>
          <div class="detail-top">
            <div>
              <p class="eyebrow">Order Detail</p>
              <div class="order-id">${order.id}</div>
              <p class="order-date">${formatDate(order.createdAt)}</p>
            </div>
            <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
          </div>

          <div class="summary-chip-grid">
            <div class="summary-chip">
              <span>주문 상태</span>
              <strong>${statusMeta.description}</strong>
            </div>
            <div class="summary-chip">
              <span>주문 요약</span>
              <strong>${getOrderSummaryText(order)}</strong>
            </div>
          </div>
        </div>

        <aside class="detail-aside-card">
          <span>관리 메모</span>
          <strong>${order.status === "완료" ? "현재 주문은 마감된 상태입니다." : "상태 변경 화면에서 다음 단계로 바로 진행할 수 있습니다."}</strong>
        </aside>
      </div>

      <div>
        <h2 class="section-title">주문 항목</h2>
        <div class="item-list">${itemRows}</div>
      </div>

      <div class="total-row">
        <span class="total-label">총 결제 금액</span>
        <span class="total-value">${formatPrice(getOrderTotalPrice(order))}</span>
      </div>
    </section>
  `;
}

const order = orderId ? getOrderById(orderId) : null;

if (!order) {
  renderEmpty();
} else {
  renderDetail(order);
}
