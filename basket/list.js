const MENU_IMAGE_FALLBACKS = {
  americano: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
  latte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  cappuccino: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80",
  "vanilla-latte": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  "earl-grey": "https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=900&q=80",
  peppermint: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80",
  "lemon-ade": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
  "grapefruit-ade": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
  cheesecake: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=900&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
};

const CATEGORY_SYMBOLS = {
  coffee: "C",
  tea: "T",
  ade: "A",
  dessert: "D",
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function init() {
  initializeSharedCustomerUI();
  bindHeaderActions();
  document.getElementById("basketContent").addEventListener("click", handleBasketClick);
  renderBasketPage();
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

function getCheckoutNoticeElement() {
  let noticeEl = document.getElementById("checkoutNotice");

  if (!noticeEl) {
    noticeEl = document.createElement("p");
    noticeEl.id = "checkoutNotice";
    noticeEl.className = "checkout-notice";
    noticeEl.setAttribute("role", "status");
    noticeEl.setAttribute("aria-live", "polite");
    document.body.appendChild(noticeEl);
  }

  return noticeEl;
}

function showCheckoutNotice(message) {
  const noticeEl = getCheckoutNoticeElement();
  noticeEl.textContent = message;
  noticeEl.classList.add("is-visible");

  window.clearTimeout(showCheckoutNotice.hideTimer);
  showCheckoutNotice.hideTimer = window.setTimeout(() => {
    noticeEl.classList.remove("is-visible");
  }, 2500);
}

function bindHeaderActions() {
  const clearCartBtn = document.getElementById("clearCartBtn");
  if (!clearCartBtn) return;

  clearCartBtn.addEventListener("click", () => {
    if (getCart().length === 0) return;

    const confirmed = window.confirm("장바구니를 모두 비울까요?");
    if (!confirmed) return;

    clearCart();
    renderBasketPage();
  });
}

function getMenuImage(menu) {
  return menu.image || MENU_IMAGE_FALLBACKS[menu.id] || "";
}

function getDisplayOptions(item, menu) {
  if (!menu || menu.categoryId === "dessert") {
    return { temperature: null, size: null };
  }

  return {
    temperature: item.temperature || (menu.categoryId === "ade" ? "ICE" : "HOT"),
    size: item.size || "Regular",
  };
}

function buildCartViewModels() {
  return getCart().map((item) => {
    const menu = getMenuById(item.menuId);
    const category = menu ? getCategoryById(menu.categoryId) : null;
    const options = getDisplayOptions(item, menu);

    return {
      ...item,
      menu,
      category,
      options,
      cartKey: getCartItemKey(item.menuId, item),
      linePrice: menu ? menu.price * item.quantity : 0,
    };
  });
}

function renderBasketPage() {
  const contentEl = document.getElementById("basketContent");
  if (!contentEl) return;

  const cartItems = buildCartViewModels();
  const validItems = cartItems.filter((item) => item.menu);
  const totalCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = validItems.reduce((sum, item) => sum + item.linePrice, 0);

  document.getElementById("summaryCount").textContent = `${totalCount}개`;
  document.getElementById("summaryPrice").textContent = formatPrice(totalPrice);
  updateCartBadge();

  if (cartItems.length === 0) {
    contentEl.innerHTML = renderEmptyState();
    return;
  }

  contentEl.innerHTML = `
    <div class="basket-shell">
      <div class="basket-list">
        ${cartItems.map(renderBasketItem).join("")}
      </div>

      <aside class="summary-panel" aria-label="주문 금액 요약">
        <div class="summary-panel-header">
          <h2>주문 금액 요약</h2>
          <p>선택한 옵션까지 포함해 한 번에 확인할 수 있습니다.</p>
        </div>

        <div class="summary-rows">
          <div class="summary-row">
            <span>총 주문 수량</span>
            <strong>${totalCount}개</strong>
          </div>
          <div class="summary-row">
            <span>메뉴 금액</span>
            <strong>${formatPrice(totalPrice)}</strong>
          </div>
          <div class="summary-row">
            <span>추가 금액</span>
            <strong>0원</strong>
          </div>
          <div class="summary-row total">
            <span>최종 결제 금액</span>
            <strong>${formatPrice(totalPrice)}</strong>
          </div>
        </div>

        <button class="checkout-btn" id="checkoutBtn" type="button" ${validItems.length === 0 ? "disabled" : ""}>
          주문하기
        </button>
        <a class="shop-link" href="../menus/list.html">메뉴 더 담기</a>
        <p class="summary-note">결제와 실제 주문 생성은 다음 단계에서 이어서 구현됩니다.</p>
      </aside>
    </div>

    <div class="bottom-bar" aria-label="모바일 주문 요약">
      <div class="bottom-bar-top">
        <div>
          <span class="bottom-bar-label">총 ${totalCount}개</span>
          <strong class="bottom-bar-price">${formatPrice(totalPrice)}</strong>
        </div>
      </div>
      <div class="bottom-bar-actions">
        <a class="shop-link" href="../menus/list.html">더 담기</a>
        <button class="checkout-btn" id="mobileCheckoutBtn" type="button" ${validItems.length === 0 ? "disabled" : ""}>
          주문하기
        </button>
      </div>
    </div>
  `;

  bindBasketEvents();
}

function generateOrderId(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateKey = `${year}${month}${day}`;
  const orderCount = getOrders().filter((order) => String(order.id).includes(`ORD-${dateKey}`)).length + 1;
  return `ORD-${dateKey}-${String(orderCount).padStart(3, "0")}`;
}

function createOrderFromCart() {
  const cartItems = buildCartViewModels().filter((item) => item.menu);
  if (!cartItems.length) {
    return null;
  }

  const now = new Date();
  const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const nextOrder = {
    id: generateOrderId(now),
    createdAt: now.toISOString(),
    status: ORDER_STATUSES[0],
    userId: currentUser ? currentUser.id : null,
    items: cartItems.map((item) => ({
      menuId: item.menuId,
      quantity: item.quantity,
      temperature: item.temperature || null,
      size: item.size || null,
    })),
  };

  saveOrders([nextOrder, ...getOrders()]);
  clearCart();

  return nextOrder;
}

function renderEmptyState() {
  return `
    <section class="empty-state">
      <div class="empty-illustration" aria-hidden="true">MY</div>
      <h2 class="empty-title">장바구니가 비어 있어요</h2>
      <p class="empty-desc">천천히 메뉴를 둘러보고 마음에 드는 음료와 디저트를 담아보세요.</p>
      <a class="shop-link" href="../menus/list.html">메뉴 보러 가기</a>
    </section>
  `;
}

function renderItemOptionBadges(item) {
  const chips = [];

  if (item.options.temperature) {
    chips.push(`<span class="item-option-chip">${escapeHTML(item.options.temperature)}</span>`);
  }

  if (item.options.size) {
    chips.push(`<span class="item-option-chip">${escapeHTML(item.options.size)}</span>`);
  }

  if (!chips.length) {
    return "";
  }

  return `<div class="item-options">${chips.join("")}</div>`;
}

function renderActionData(item) {
  return `
    data-menu-id="${escapeHTML(item.menuId)}"
    data-temperature="${escapeHTML(item.temperature || "")}"
    data-size="${escapeHTML(item.size || "")}"
    data-cart-key="${escapeHTML(item.cartKey)}"
  `;
}

function renderBasketItem(item) {
  if (!item.menu) {
    return `
      <article class="basket-item missing-item">
        <div class="basket-item-body">
          <div class="missing-icon" aria-hidden="true">!</div>
          <div>
            <div class="basket-item-header">
              <div>
                <h3 class="item-name">삭제된 메뉴</h3>
                <p class="item-desc">더 이상 판매하지 않는 메뉴입니다. 목록에서 정리해 주세요.</p>
              </div>
              <span class="item-line-price">-</span>
            </div>
            <div class="item-controls">
              <span class="soldout-chip">주문 불가</span>
              <div class="item-actions">
                <button class="remove-btn" type="button" data-action="remove" ${renderActionData(item)}>삭제</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  const imageUrl = getMenuImage(item.menu);
  const fallbackLetter = CATEGORY_SYMBOLS[item.menu.categoryId] || "M";
  const imageClass = imageUrl ? "" : " is-fallback";

  return `
    <article class="basket-item">
      <div class="basket-item-body">
        <a
          class="basket-item-image${imageClass}"
          data-fallback="${escapeHTML(fallbackLetter)}"
          href="../menus/detail.html?id=${encodeURIComponent(item.menu.id)}"
          aria-label="${escapeHTML(item.menu.name)} 상세 보기"
        >
          <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(item.menu.name)}" loading="lazy" />
        </a>

        <div>
          <div class="basket-item-header">
            <div>
              ${item.category ? `<span class="item-category">${escapeHTML(item.category.name)}</span>` : ""}
              <h3 class="item-name">${escapeHTML(item.menu.name)}</h3>
              ${renderItemOptionBadges(item)}
              <p class="item-desc">${escapeHTML(item.menu.description || "매장에서 준비한 메뉴입니다.")}</p>
              ${item.menu.soldOut ? '<span class="soldout-chip">현재 품절된 메뉴예요</span>' : ""}
            </div>
            <span class="item-line-price">${formatPrice(item.linePrice)}</span>
          </div>

          <div class="item-controls">
            <div class="quantity-panel">
              <span class="quantity-label">수량</span>
              <div class="quantity-stepper">
                <button class="quantity-btn" type="button" data-action="decrease" ${renderActionData(item)} aria-label="수량 감소">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" type="button" data-action="increase" ${renderActionData(item)} aria-label="수량 증가">+</button>
              </div>
            </div>

            <div class="item-actions">
              <a class="menu-link" href="../menus/detail.html?id=${encodeURIComponent(item.menu.id)}">상세</a>
              <button class="remove-btn" type="button" data-action="remove" ${renderActionData(item)}>삭제</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindBasketEvents() {
  ["checkoutBtn", "mobileCheckoutBtn"].forEach((id) => {
    const checkoutBtn = document.getElementById(id);
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener("click", handleCheckout);
  });
}

function handleCheckout() {
  if (!isLoggedIn()) {
    showLoginRequiredModal({
      title: "로그인이 필요해요",
      message: "주문하려면 로그인이 필요합니다. 담아둔 메뉴는 로그인 후에도 유지됩니다.",
    });
    return;
  }

  const order = createOrderFromCart();
  if (!order) {
    renderBasketPage();
    return;
  }

  renderBasketPage();
  showCheckoutNotice("주문이 완료되었습니다.");

  window.setTimeout(() => {
    window.location.href = "../orders/list.html";
  }, 2500);
}

function readItemOptionsFromDataset(dataset) {
  return {
    temperature: dataset.temperature || null,
    size: dataset.size || null,
  };
}

function handleBasketClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, cartKey, menuId } = target.dataset;
  if (!menuId) return;

  const currentItem = getCart().find((item) => getCartItemKey(item.menuId, item) === cartKey);
  const options = currentItem
    ? { temperature: currentItem.temperature, size: currentItem.size }
    : readItemOptionsFromDataset(target.dataset);

  if (action === "increase" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity + 1, options);
  }

  if (action === "decrease" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity - 1, options);
  }

  if (action === "remove") {
    removeFromCart(menuId, options);
  }

  renderBasketPage();
}

init();
