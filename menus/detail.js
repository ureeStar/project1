const MENU_IMAGE_FALLBACKS = {
  americano: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80",
  latte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  cappuccino: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1200&q=80",
  "vanilla-latte": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
  "earl-grey": "https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=1200&q=80",
  peppermint: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80",
  "lemon-ade": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80",
  "grapefruit-ade": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
  cheesecake: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=1200&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
};

const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Non-Coffee",
  ade: "Non-Coffee",
  dessert: "Dessert",
};

let currentMenu = null;
let quantity = 1;

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMenuImage(menu) {
  return menu.image || MENU_IMAGE_FALLBACKS[menu.id] || MENU_IMAGE_FALLBACKS.americano;
}

function getCategoryLabel(categoryId) {
  const category = getCategoryById(categoryId);
  return CATEGORY_LABELS[categoryId] || (category ? category.name : "Seasonal");
}

function isDessertMenu(menu) {
  return menu?.categoryId === "dessert";
}

function isAdeMenu(menu) {
  return menu?.categoryId === "ade";
}

function getDefaultOptions(menu) {
  if (isDessertMenu(menu)) {
    return { temperature: null, size: null };
  }

  return {
    temperature: isAdeMenu(menu) ? "ICE" : "HOT",
    size: "Regular",
  };
}

function renderOptionButton(label, value, isSelected, isLocked = false) {
  return `
    <button
      type="button"
      data-option-value="${escapeHTML(value)}"
      ${isSelected ? 'class="selected"' : ""}
      ${isLocked ? "disabled" : ""}
      ${isSelected ? 'aria-pressed="true"' : 'aria-pressed="false"'}
    >${escapeHTML(label)}</button>
  `;
}

function renderTemperatureControl(menu) {
  if (isDessertMenu(menu)) {
    return "";
  }

  const defaultOptions = getDefaultOptions(menu);

  if (isAdeMenu(menu)) {
    return `
      <div class="option-group">
        <div class="option-heading">
          <span class="option-title">온도</span>
          <span class="option-hint">에이드는 아이스만 제공됩니다</span>
        </div>
        <div class="segmented-control is-single" aria-label="온도 옵션" data-option-group="temperature">
          ${renderOptionButton("ICE", defaultOptions.temperature, true, true)}
        </div>
      </div>
    `;
  }

  return `
    <div class="option-group">
      <span class="option-title">온도</span>
      <div class="segmented-control" aria-label="온도 옵션" data-option-group="temperature">
        ${renderOptionButton("Hot", "HOT", defaultOptions.temperature === "HOT")}
        ${renderOptionButton("Ice", "ICE", defaultOptions.temperature === "ICE")}
      </div>
    </div>
  `;
}

function renderSizeControl(menu) {
  if (isDessertMenu(menu)) {
    return "";
  }

  const defaultOptions = getDefaultOptions(menu);

  return `
    <div class="option-group">
      <span class="option-title">사이즈</span>
      <div class="segmented-control" aria-label="사이즈 옵션" data-option-group="size">
        ${renderOptionButton("Regular", "Regular", defaultOptions.size === "Regular")}
        ${renderOptionButton("Large", "Large", defaultOptions.size === "Large")}
      </div>
    </div>
  `;
}

function getSelectedOptionValue(groupName) {
  const selected = document.querySelector(`[data-option-group="${groupName}"] button.selected`);
  return selected?.dataset.optionValue || null;
}

function getSelectedCartOptions() {
  const defaults = getDefaultOptions(currentMenu);
  return {
    temperature: getSelectedOptionValue("temperature") || defaults.temperature,
    size: getSelectedOptionValue("size") || defaults.size,
  };
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const menuId = params.get("id");
  currentMenu = menuId ? getMenuById(menuId) : null;
  quantity = 1;

  renderMenuDetail();
  updateCartBadge();
}

function renderMenuDetail() {
  const detailEl = document.getElementById("menuDetail");
  if (!detailEl) return;

  if (!currentMenu) {
    detailEl.innerHTML = `
      <section class="not-found">
        <strong>메뉴를 찾을 수 없습니다.</strong>
        <a class="secondary-button" href="list.html">목록으로 돌아가기</a>
      </section>
    `;
    return;
  }

  const soldOut = Boolean(currentMenu.soldOut);

  detailEl.innerHTML = `
    <section class="detail-layout">
      <div class="menu-detail-image">
        <img src="${escapeHTML(getMenuImage(currentMenu))}" alt="${escapeHTML(currentMenu.name)}" />
        ${soldOut ? '<span class="menu-detail-soldout">Sold out</span>' : ""}
      </div>

      <div class="menu-detail-body">
        <a class="back-link" href="list.html">메뉴 목록</a>
        <span class="menu-detail-category">${escapeHTML(getCategoryLabel(currentMenu.categoryId))}</span>
        <h1 class="menu-detail-name">${escapeHTML(currentMenu.name)}</h1>
        <p class="menu-detail-price">${formatPrice(Number(currentMenu.price) || 0)}</p>
        <p class="menu-detail-desc">${escapeHTML(currentMenu.description || "매장에서 준비한 오늘의 메뉴입니다.")}</p>

        <dl class="menu-meta">
          <div>
            <dt>구성</dt>
            <dd>주문 즉시 정성스럽게 준비해 드립니다</dd>
          </div>
          <div>
            <dt>안내</dt>
            <dd>알레르기 정보와 재고 상황은 매장 기준으로 운영됩니다</dd>
          </div>
        </dl>

        ${soldOut ? renderSoldOutNotice() : renderOrderControls()}
      </div>
    </section>

    <section class="recommend-section" aria-labelledby="recommendTitle">
      <div class="section-heading">
        <p class="section-kicker">You may also like</p>
        <h2 id="recommendTitle">함께 보기 좋은 메뉴</h2>
      </div>
      <div class="recommend-grid">${renderRecommendedMenus()}</div>
    </section>
  `;

  if (!soldOut) {
    bindOptionEvents();
    bindQuantityEvents();
    bindAddToCartEvent();
  }
}

function renderSoldOutNotice() {
  return `
    <div class="soldout-panel">
      <strong>지금은 준비가 끝난 메뉴입니다.</strong>
      <p>다른 추천 메뉴를 둘러보거나, 다음 방문 때 다시 확인해 주세요.</p>
    </div>
  `;
}

function renderOrderControls() {
  return `
    <section class="order-panel" aria-label="주문 옵션">
      ${renderTemperatureControl(currentMenu)}
      ${renderSizeControl(currentMenu)}

      <div class="quantity-stepper">
        <span class="option-title">수량</span>
        <div>
          <button class="quantity-btn" id="decreaseBtn" type="button" aria-label="수량 감소">-</button>
          <span class="quantity-value" id="quantityValue">${quantity}</span>
          <button class="quantity-btn" id="increaseBtn" type="button" aria-label="수량 증가">+</button>
        </div>
      </div>
    </section>

    ${renderActionBar()}
  `;
}

function renderActionBar() {
  return `
    <div class="action-bar glass">
      <div>
        <span>총 금액</span>
        <strong class="action-bar-total" id="actionBarTotal">${formatPrice(currentMenu.price * quantity)}</strong>
      </div>
      <button class="add-to-cart-btn" id="addToCartBtn" type="button">장바구니 담기</button>
    </div>
  `;
}

function renderRecommendedMenus() {
  const menus = getAllMenus()
    .filter((menu) => menu.id !== currentMenu.id && !menu.soldOut)
    .slice(0, 3);

  if (!menus.length) {
    return '<p class="empty-state">추천 가능한 메뉴가 없습니다.</p>';
  }

  return menus
    .map(
      (menu) => `
        <a class="recommend-card" href="detail.html?id=${encodeURIComponent(menu.id)}">
          <img src="${escapeHTML(getMenuImage(menu))}" alt="${escapeHTML(menu.name)}" loading="lazy" />
          <span>${escapeHTML(getCategoryLabel(menu.categoryId))}</span>
          <strong>${escapeHTML(menu.name)}</strong>
          <small>${formatPrice(menu.price)}</small>
        </a>
      `
    )
    .join("");
}

function bindOptionEvents() {
  document.querySelectorAll(".segmented-control").forEach((control) => {
    control.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;

      const button = event.target.closest("button");
      if (!button || button.disabled) return;

      control.querySelectorAll("button").forEach((item) => {
        const isSelected = item === button;
        item.classList.toggle("selected", isSelected);
        item.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });
    });
  });
}

function bindQuantityEvents() {
  const decreaseBtn = document.getElementById("decreaseBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  if (!decreaseBtn || !increaseBtn) return;

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
  const quantityValue = document.getElementById("quantityValue");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const actionBarTotal = document.getElementById("actionBarTotal");

  if (quantityValue) quantityValue.textContent = quantity;
  if (decreaseBtn) decreaseBtn.disabled = quantity <= 1;
  if (actionBarTotal) actionBarTotal.textContent = formatPrice(currentMenu.price * quantity);
}

function bindAddToCartEvent() {
  const addToCartBtn = document.getElementById("addToCartBtn");
  if (!addToCartBtn) return;

  addToCartBtn.addEventListener("click", () => {
    addToCart(currentMenu.id, quantity, getSelectedCartOptions());
    updateCartBadge();

    const originalText = addToCartBtn.textContent;
    addToCartBtn.textContent = "담았습니다";
    addToCartBtn.disabled = true;

    window.setTimeout(() => {
      addToCartBtn.textContent = originalText;
      addToCartBtn.disabled = false;
    }, 1200);
  });
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
