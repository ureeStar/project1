const statusFilter = document.getElementById("statusFilter");
const keywordInput = document.getElementById("keywordInput");
const orderList = document.getElementById("orderList");
const totalCount = document.getElementById("totalCount");
const receivedCount = document.getElementById("receivedCount");
const preparingCount = document.getElementById("preparingCount");
const doneCount = document.getElementById("doneCount");
const resultText = document.getElementById("resultText");

function getFilteredOrders() {
  const status = statusFilter.value;
  const keyword = keywordInput.value.trim().toLowerCase();

  return getOrders()
    .filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesKeyword = !keyword || order.id.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderSummary() {
  const orders = getOrders();
  totalCount.textContent = orders.length;
  receivedCount.textContent = orders.filter((order) => order.status === "주문접수").length;
  preparingCount.textContent = orders.filter((order) => order.status === "준비중").length;
  doneCount.textContent = orders.filter((order) => order.status === "완료").length;
}

function getNextStatus(status) {
  const index = ORDER_STATUSES.indexOf(status);
  if (index === -1 || index === ORDER_STATUSES.length - 1) return null;
  return ORDER_STATUSES[index + 1];
}

function renderList() {
  const orders = getFilteredOrders();
  resultText.textContent = `총 ${orders.length}건`;

  if (!orders.length) {
    orderList.innerHTML = `
      <div class="empty-state">
        조건에 맞는 주문이 없어요. 필터를 바꿔보세요.
      </div>
    `;
    return;
  }

  orderList.innerHTML = orders
    .map((order) => {
      const nextStatus = getNextStatus(order.status);
      return `
        <article class="order-card">
          <div class="order-card-top">
            <span class="order-card-id">${order.id}</span>
            <span class="order-status ${getStatusClass(order.status)}">${order.status}</span>
          </div>
          <span class="order-card-date">${formatDate(order.createdAt)}</span>
          <span class="order-card-summary">${getOrderSummaryText(order)}</span>
          <div class="order-card-footer">
            <span class="order-card-total">${formatPrice(getOrderTotalPrice(order))}</span>
            <div class="action-group">
              <a class="action-button" href="./detail.html?id=${encodeURIComponent(order.id)}">상세 보기</a>
              <a class="action-button" href="./edit.html?id=${encodeURIComponent(order.id)}">수정</a>
              ${
                nextStatus
                  ? `<button class="action-button" type="button" data-action="advance" data-id="${order.id}">${nextStatus}(으)로 변경</button>`
                  : ""
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!id) return;

  if (action === "advance") {
    const order = getOrderById(id);
    if (!order) return;

    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    updateOrderStatus(id, nextStatus);
    renderSummary();
    renderList();
  }
}

function initializePage() {
  renderSummary();
  renderList();

  statusFilter.addEventListener("change", renderList);
  keywordInput.addEventListener("input", renderList);
  orderList.addEventListener("click", handleListClick);
}

initializePage();
