function init() {
  bindHeaderActions();
  document.getElementById("basketContent").addEventListener("click", handleBasketClick);
  renderBasketPage();
}

function bindHeaderActions() {
  const clearCartBtn = document.getElementById("clearCartBtn");

  clearCartBtn.addEventListener("click", () => {
    if (getCart().length === 0) {
      return;
    }

    const confirmed = window.confirm("장바구니를 모두 비울까요?");
    if (!confirmed) {
      return;
    }

    clearCart();
    renderBasketPage();
  });
}

function buildCartViewModels() {
  return getCart().map((item) => {
    const menu = getMenuById(item.menuId);
    const category = menu ? getCategoryById(menu.categoryId) : null;

    return {
      ...item,
      menu,
      category,
      linePrice: menu ? menu.price * item.quantity : 0,
    };
  });
}

function renderBasketPage() {
  const contentEl = document.getElementById("basketContent");
  const cartItems = buildCartViewModels();
  const validItems = cartItems.filter((item) => item.menu);
  const totalCount = validItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = validItems.reduce((sum, item) => sum + item.linePrice, 0);

  document.getElementById("summaryCount").textContent = `${totalCount}개`;
  document.getElementById("summaryPrice").textContent = formatPrice(totalPrice);

  if (cartItems.length === 0) {
    contentEl.innerHTML = renderEmptyState();
    return;
  }

  contentEl.innerHTML = `
    <div class="basket-list">
      ${cartItems.map(renderBasketItem).join("")}
    </div>
    <div class="bottom-bar glass">
      <div class="bottom-bar-top">
        <div>
          <span class="bottom-bar-label">총 주문 수량</span>
          <strong>${totalCount}개</strong>
        </div>
        <div>
          <span class="bottom-bar-label">총 결제 예정 금액</span>
          <strong class="bottom-bar-price">${formatPrice(totalPrice)}</strong>
        </div>
      </div>
      <div class="bottom-bar-actions">
        <a class="shop-link" href="../menus/list.html">메뉴 더 담기</a>
        <button class="checkout-btn" id="checkoutBtn" type="button" ${validItems.length === 0 ? "disabled" : ""}>
          주문 단계는 5단계에서 구현
        </button>
      </div>
    </div>
  `;

  bindBasketEvents();
}

function renderEmptyState() {
  return `
    <section class="empty-state">
      <h2 class="empty-title">장바구니가 비어 있어요</h2>
      <p class="empty-desc">메뉴를 둘러보고 원하는 음료와 디저트를 담아보세요.</p>
      <a class="shop-link" href="../menus/list.html">메뉴 보러 가기</a>
    </section>
  `;
}

function renderBasketItem(item) {
  if (!item.menu) {
    return `
      <article class="basket-item missing-item">
        <div class="basket-item-top">
          <div class="item-emoji">⚠️</div>
          <div>
            <h3 class="item-name">삭제된 메뉴</h3>
            <p class="item-desc">더 이상 존재하지 않는 메뉴예요. 삭제 후 다시 담아주세요.</p>
          </div>
          <span class="item-price">-</span>
        </div>
        <div class="item-meta">
          <span class="soldout-chip">주문 불가</span>
          <div class="item-actions">
            <button class="remove-btn" type="button" data-action="remove" data-menu-id="${item.menuId}">삭제</button>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="basket-item">
      <div class="basket-item-top">
        <div class="item-emoji">${item.menu.categoryId === "dessert" ? "🥐" : item.menu.categoryId === "tea" ? "🍵" : item.menu.categoryId === "ade" ? "🍹" : "☕"}</div>
        <div>
          ${item.category ? `<span class="item-category">${item.category.name}</span>` : ""}
          <h3 class="item-name">${item.menu.name}</h3>
          <p class="item-desc">${item.menu.description}</p>
          ${item.menu.soldOut ? `<span class="soldout-chip">현재 품절된 메뉴예요</span>` : ""}
        </div>
        <span class="item-price">${formatPrice(item.linePrice)}</span>
      </div>
      <div class="item-meta">
        <div class="quantity-stepper">
          <button class="quantity-btn" type="button" data-action="decrease" data-menu-id="${item.menu.id}" aria-label="수량 감소">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" type="button" data-action="increase" data-menu-id="${item.menu.id}" aria-label="수량 증가">+</button>
        </div>
        <div class="item-actions">
          <a class="menu-link" href="../menus/detail.html?id=${encodeURIComponent(item.menu.id)}">상세</a>
          <button class="remove-btn" type="button" data-action="remove" data-menu-id="${item.menu.id}">삭제</button>
        </div>
      </div>
    </article>
  `;
}

function bindBasketEvents() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      window.alert("주문 기능은 다음 5단계에서 이어서 구현됩니다.");
    });
  }
}

function handleBasketClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const { action, menuId } = target.dataset;
  if (!menuId) {
    return;
  }

  const currentItem = getCart().find((item) => item.menuId === menuId);

  if (action === "increase" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity + 1);
  }

  if (action === "decrease" && currentItem) {
    updateCartItemQuantity(menuId, currentItem.quantity - 1);
  }

  if (action === "remove") {
    removeFromCart(menuId);
  }

  renderBasketPage();
}

init();
