const ITEMS_PER_PAGE = 5;

const statusFilter = document.getElementById("statusFilter");
const keywordInput = document.getElementById("keywordInput");
const orderList = document.getElementById("orderList");
const orderPagination = document.getElementById("orderPagination");
const totalCount = document.getElementById("totalCount");
const receivedCount = document.getElementById("receivedCount");
const preparingCount = document.getElementById("preparingCount");
const doneCount = document.getElementById("doneCount");
const resultText = document.getElementById("resultText");

let currentPage = 1;

function getStatusMeta(status) {
  if (status === "완료") {
    return {
      className: "status-done",
      label: "완료",
      description: "고객 수령까지 마무리된 주문입니다.",
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

function getPageCount(totalItems) {
  return Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
}

function getVisibleOrders(orders) {
  const pageCount = getPageCount(orders.length);
  currentPage = Math.min(Math.max(currentPage, 1), pageCount);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

function renderPagination(totalItems) {
  const pageCount = getPageCount(totalItems);

  if (totalItems === 0 || pageCount === 1) {
    orderPagination.innerHTML = "";
    orderPagination.hidden = true;
    return;
  }

  orderPagination.hidden = false;

  const pageButtons = Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;
    const isCurrent = page === currentPage;

    return `
      <button
        class="pagination-button${isCurrent ? " is-active" : ""}"
        type="button"
        data-page="${page}"
        ${isCurrent ? 'aria-current="page"' : ""}
      >
        ${page}
      </button>
    `;
  }).join("");

  orderPagination.innerHTML = `
    <button
      class="pagination-button pagination-button-nav"
      type="button"
      data-page="${currentPage - 1}"
      ${currentPage === 1 ? "disabled" : ""}
      aria-label="이전 페이지"
    >
      Prev
    </button>
    <div class="pagination-pages">${pageButtons}</div>
    <button
      class="pagination-button pagination-button-nav"
      type="button"
      data-page="${currentPage + 1}"
      ${currentPage === pageCount ? "disabled" : ""}
      aria-label="다음 페이지"
    >
      Next
    </button>
  `;
}

function renderList() {
  const orders = getFilteredOrders();
  const pageCount = getPageCount(orders.length);
  currentPage = Math.min(Math.max(currentPage, 1), pageCount);
  resultText.textContent = orders.length ? `총 ${orders.length}건 · ${currentPage} / ${pageCount} 페이지` : "총 0건";

  if (!orders.length) {
    orderList.innerHTML = `
      <div class="empty-state">
        조건에 맞는 주문이 없습니다. 검색어를 바꾸거나 상태 필터를 다시 선택해 보세요.
      </div>
    `;
    renderPagination(0);
    return;
  }

  const visibleOrders = getVisibleOrders(orders);

  orderList.innerHTML = visibleOrders
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

  renderPagination(orders.length);
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

function handlePaginationClick(event) {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) {
    return;
  }

  currentPage = Number(button.dataset.page);
  renderList();
}

function handleFilterChange() {
  currentPage = 1;
  renderList();
}

function initializePage() {
  renderSummary();
  renderList();

  statusFilter.addEventListener("change", handleFilterChange);
  keywordInput.addEventListener("input", handleFilterChange);
  orderList.addEventListener("click", handleListClick);
  orderPagination.addEventListener("click", handlePaginationClick);
}

initializePage();
