const ITEMS_PER_PAGE = 5;

let currentPage = 1;

function init() {
  initializeSharedCustomerUI();
  renderOrderList();
  updateCartBadge();

  const paginationEl = document.getElementById("orderPagination");
  paginationEl.addEventListener("click", handlePaginationClick);
}

function getDisplayStatusMeta(status) {
  const map = {
    주문접수: {
      label: "접수",
      className: "status-received",
      emphasis: "주문이 접수되었습니다.",
    },
    준비중: {
      label: "제조중",
      className: "status-making",
      emphasis: "음료를 정성껏 준비하고 있습니다.",
    },
    완료: {
      label: "픽업완료",
      className: "status-picked",
      emphasis: "주문 수령이 완료되었습니다.",
    },
  };

  return (
    map[status] || {
      label: status,
      className: "status-received",
      emphasis: "주문 상태를 확인해 주세요.",
    }
  );
}

function getSortedOrders() {
  return getOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
  const paginationEl = document.getElementById("orderPagination");
  const pageCount = getPageCount(totalItems);

  if (totalItems === 0 || pageCount === 1) {
    paginationEl.innerHTML = "";
    paginationEl.hidden = true;
    return;
  }

  paginationEl.hidden = false;

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

  paginationEl.innerHTML = `
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

function renderOrderList() {
  const listEl = document.getElementById("orderList");
  const orders = getSortedOrders();

  if (orders.length === 0) {
    listEl.innerHTML = '<p class="empty-state">주문 내역이 없습니다.</p>';
    renderPagination(0);
    return;
  }

  const visibleOrders = getVisibleOrders(orders);

  listEl.innerHTML = visibleOrders
    .map((order) => {
      const statusMeta = getDisplayStatusMeta(order.status);

      return `
        <a class="order-card glass" href="detail.html?id=${encodeURIComponent(order.id)}">
          <div class="order-card-top">
            <div class="order-card-headline">
              <span class="order-card-id">${order.id}</span>
              <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
            </div>
            <div class="order-card-stage">
              <span class="order-card-stage-label">현재 상태</span>
              <span class="order-card-stage-text">${statusMeta.emphasis}</span>
            </div>
          </div>
          <span class="order-card-date">${formatDate(order.createdAt)}</span>
          <span class="order-card-summary">${getOrderSummaryText(order)}</span>
          <div class="order-card-bottom">
            <span class="order-card-total">${formatPrice(getOrderTotalPrice(order))}</span>
            <span class="order-card-arrow" aria-hidden="true">→</span>
          </div>
        </a>
      `;
    })
    .join("");

  renderPagination(orders.length);
}

function handlePaginationClick(event) {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) {
    return;
  }

  currentPage = Number(button.dataset.page);
  renderOrderList();
}

function updateCartBadge() {
  const badgeEls = document.querySelectorAll("[data-cart-badge]");
  if (!badgeEls.length) return;
  const count = getCartTotalCount();

  badgeEls.forEach((badgeEl) => {
    if (count > 0) {
      badgeEl.textContent = count > 99 ? "99+" : String(count);
      badgeEl.hidden = false;
    } else {
      badgeEl.hidden = true;
    }
  });
}

init();
