const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>주문을 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

function renderDetail(order) {
  editLink.href = `./edit.html?id=${encodeURIComponent(order.id)}`;

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
      <div class="detail-top">
        <div>
          <p class="eyebrow">Order Detail</p>
          <div class="order-id">${order.id}</div>
        </div>
        <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
      </div>
      <p class="order-date">${formatDate(order.createdAt)}</p>

      <h2 class="section-title">주문 항목</h2>
      <div class="item-list">${itemRows}</div>

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
