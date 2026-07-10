// ===== 상태 =====
let currentMenu = null;
let quantity = 1;

// ===== 초기화 =====
function init() {
  const params = new URLSearchParams(window.location.search);
  const menuId = params.get("id");
  currentMenu = menuId ? getMenuById(menuId) : null;

  renderMenuDetail();
  updateCartBadge();
}

// ===== 메뉴 상세 렌더링 =====
function renderMenuDetail() {
  const detailEl = document.getElementById("menuDetail");

  if (!currentMenu) {
    detailEl.innerHTML = `<p class="not-found">메뉴를 찾을 수 없습니다.</p>`;
    return;
  }

  const category = getCategoryById(currentMenu.categoryId);
  const soldOut = currentMenu.soldOut;

  detailEl.innerHTML = `
    <div class="menu-detail-image">☕</div>
    <div class="menu-detail-body">
      ${category ? `<span class="menu-detail-category">${category.name}</span>` : ""}
      <h2 class="menu-detail-name">${currentMenu.name}</h2>
      <p class="menu-detail-price">${formatPrice(currentMenu.price)}</p>
      <p class="menu-detail-desc">${currentMenu.description}</p>
      ${soldOut ? `<span class="menu-detail-soldout">품절된 메뉴입니다</span>` : renderQuantityStepper()}
    </div>
    ${soldOut ? "" : renderActionBar()}
  `;

  if (!soldOut) {
    bindQuantityEvents();
    bindAddToCartEvent();
  }
}

function renderQuantityStepper() {
  return `
    <div class="quantity-stepper">
      <button class="quantity-btn" id="decreaseBtn" aria-label="수량 감소">-</button>
      <span class="quantity-value" id="quantityValue">${quantity}</span>
      <button class="quantity-btn" id="increaseBtn" aria-label="수량 증가">+</button>
    </div>
  `;
}

function renderActionBar() {
  return `
    <div class="action-bar glass">
      <span class="action-bar-total" id="actionBarTotal">${formatPrice(currentMenu.price * quantity)}</span>
      <button class="add-to-cart-btn" id="addToCartBtn">장바구니 담기</button>
    </div>
  `;
}

// ===== 수량 조절 =====
function bindQuantityEvents() {
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");

  decreaseBtn.disabled = quantity <= 1;

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity -= 1;
      updateQuantityDisplay();
    }
  });

  increaseBtn.addEventListener("click", () => {
    quantity += 1;
    updateQuantityDisplay();
  });
}

function updateQuantityDisplay() {
  document.getElementById("quantityValue").textContent = quantity;
  document.getElementById("decreaseBtn").disabled = quantity <= 1;
  document.getElementById("actionBarTotal").textContent = formatPrice(currentMenu.price * quantity);
}

// ===== 장바구니 담기 =====
function bindAddToCartEvent() {
  const addToCartBtn = document.getElementById("addToCartBtn");

  addToCartBtn.addEventListener("click", () => {
    addToCart(currentMenu.id, quantity);
    updateCartBadge();

    const originalText = addToCartBtn.textContent;
    addToCartBtn.textContent = "담았습니다!";
    addToCartBtn.disabled = true;

    setTimeout(() => {
      addToCartBtn.textContent = originalText;
      addToCartBtn.disabled = false;
    }, 1200);
  });
}

// ===== 장바구니 배지 =====
function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

init();
