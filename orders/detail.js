let currentOrder = null;

function getDisplayStatusMeta(status) {
  const map = {
    주문접수: {
      label: "접수",
      className: "status-received",
      message: "주문이 접수되어 바에서 확인 중입니다.",
      stepIndex: 0,
    },
    준비중: {
      label: "제조중",
      className: "status-making",
      message: "바리스타가 음료를 준비하고 있습니다.",
      stepIndex: 1,
    },
    완료: {
      label: "픽업완료",
      className: "status-picked",
      message: "주문 수령이 완료되었습니다.",
      stepIndex: 3,
    },
  };

  return (
    map[status] || {
      label: status,
      className: "status-received",
      message: "주문 상태를 확인해 주세요.",
      stepIndex: 0,
    }
  );
}

function renderProgressSteps(activeStepIndex) {
  const steps = [
    { label: "접수", caption: "주문 확인" },
    { label: "제조중", caption: "음료 준비" },
    { label: "준비완료", caption: "픽업 대기" },
    { label: "픽업완료", caption: "수령 완료" },
  ];

  return steps
    .map((step, index) => {
      let stateClass = "is-upcoming";

      if (index < activeStepIndex) {
        stateClass = "is-complete";
      } else if (index === activeStepIndex) {
        stateClass = "is-current";
      }

      return `
        <div class="order-progress-step ${stateClass}">
          <span class="order-progress-dot">${index + 1}</span>
          <div class="order-progress-text">
            <span class="order-progress-label">${step.label}</span>
            <span class="order-progress-caption">${step.caption}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function init() {
  initializeSharedCustomerUI();
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("id");
  currentOrder = getAccessibleOrder(orderId);

  renderOrderDetail();
  updateCartBadge();
}

function getAccessibleOrder(orderId) {
  if (!orderId) {
    return null;
  }

  const user = getCurrentUser();
  if (!user) {
    return null;
  }

  return getOrdersByUserId(user.id).find((order) => order.id === orderId) || null;
}

function renderOrderDetail() {
  const detailEl = document.getElementById("orderDetail");

  if (!currentOrder) {
    detailEl.innerHTML = '<p class="not-found">주문을 찾을 수 없습니다.</p>';
    return;
  }

  const itemRows = currentOrder.items
    .map((item) => {
      const menu = getMenuById(item.menuId);
      const name = menu ? menu.name : "알 수 없는 메뉴";
      const subtotal = menu ? menu.price * item.quantity : 0;

      return `
        <div class="order-item-row">
          <div>
            <div class="order-item-name">${name}</div>
            <div class="order-item-qty">${item.quantity}개</div>
          </div>
          <span class="order-item-subtotal">${formatPrice(subtotal)}</span>
        </div>
      `;
    })
    .join("");

  const totalPrice = currentOrder.items.reduce((total, item) => {
    const menu = getMenuById(item.menuId);
    return menu ? total + menu.price * item.quantity : total;
  }, 0);

  const statusMeta = getDisplayStatusMeta(currentOrder.status);

  detailEl.innerHTML = `
    <div class="order-detail-shell">
      <section class="order-status-panel glass">
        <div class="order-detail-top">
          <div class="order-detail-heading">
            <span class="order-detail-label">Order Detail</span>
            <span class="order-detail-id">${currentOrder.id}</span>
            <p class="order-detail-date">${formatDate(currentOrder.createdAt)}</p>
          </div>
          <span class="order-status ${statusMeta.className}">${statusMeta.label}</span>
        </div>
        <div class="order-status-copy">
          <p class="order-status-kicker">Current Status</p>
          <p class="order-status-message">${statusMeta.message}</p>
        </div>
        <div class="order-progress" aria-label="주문 진행 상태">
          ${renderProgressSteps(statusMeta.stepIndex)}
        </div>
      </section>

      <div class="order-item-list glass">
        ${itemRows}
      </div>

      <div class="order-total-row glass">
        <span class="order-total-label">총 결제 금액</span>
        <span class="order-total-value">${formatPrice(totalPrice)}</span>
      </div>
    </div>
  `;
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
