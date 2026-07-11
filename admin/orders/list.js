const statusFilter = document.getElementById("statusFilter");
const keywordInput = document.getElementById("keywordInput");
const orderList = document.getElementById("orderList");
const totalCount = document.getElementById("totalCount");
const receivedCount = document.getElementById("receivedCount");
const preparingCount = document.getElementById("preparingCount");
const doneCount = document.getElementById("doneCount");
const resultText = document.getElementById("resultText");

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
    description: "결제 완료 후 대기 중인 주문입니다.",
  };
}

function getFilteredOrders() {
  const status = statusFilter.value;
  const keyword = keywordInput.value.trim().toLowerCase();

  return getOrders()
    .filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const summarySource = `${order.id} ${getOrderSummaryText(order)}`.toLowerCase();
      const matchesKeyword = !keyword || summarySource.includes(keyword);
      return matchesStatus && matchesKeyword;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderSummary() {
  const orders = getOrders();
  totalCount.textContent = String(orders.length);
  receivedCount.textContent = String(orders.filter((order) => order.status === "주문접수").length);
  preparingCount.textContent = String(orders.filter((order) => order.status === "준비중").length);
  doneCount.textContent = String(orders.filter((order) => order.status === "완료").length);
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
        조건에 맞는 주문이 없습니다. 검색어를 바꾸거나 상태 필터를 다시 선택해 보세요.
      </div>
    `;
    return;
  }

  orderList.innerHTML = orders
    .map((order) => {
      const nextStatus = getNextStatus(order.status);
      const statusMeta = getStatusMeta(order.status);
      return `
        <article class="order-card">
          <div class="order-card-top">
            <div class="order-card-heading">
              <span class="order-card-id">${order.id}</span>
              <span class="order-card-date">${formatDate(order.createdAt)}</span>
            </div>
            <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
          </div>

          <p class="order-card-summary">${getOrderSummaryText(order)}</p>

          <div class="order-card-meta">
            <div class="order-meta-chip">
              <span>현재 상태</span>
              <strong>${statusMeta.description}</strong>
            </div>
            <div class="order-meta-chip">
              <span>다음 액션</span>
              <strong>${nextStatus ? `${nextStatus}로 변경 가능` : "추가 상태 변경 없음"}</strong>
            </div>
          </div>

          <div class="order-card-footer">
            <span class="order-card-total">${formatPrice(getOrderTotalPrice(order))}</span>
            <div class="action-group">
              <a class="action-button" href="./detail.html?id=${encodeURIComponent(order.id)}">상세 보기</a>
              <a class="action-button" href="./edit.html?id=${encodeURIComponent(order.id)}">상태 수정</a>
              ${
                nextStatus
                  ? `<button class="action-button" type="button" data-action="advance" data-id="${order.id}">${nextStatus}로 변경</button>`
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
