// ===== 상태 =====
let selectedCategoryId = "all";

// ===== 초기화 =====
function init() {
  renderCategoryTabs();
  renderMenuGrid();
  updateCartBadge();
}

// ===== 카테고리 탭 =====
function renderCategoryTabs() {
  const tabsEl = document.getElementById("categoryTabs");
  const allTabs = [{ id: "all", name: "전체" }, ...CATEGORIES];

  tabsEl.innerHTML = allTabs
    .map(
      (category) => `
        <button
          class="category-tab${category.id === selectedCategoryId ? " active" : ""}"
          data-category-id="${category.id}"
        >${category.name}</button>
      `
    )
    .join("");

  tabsEl.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      selectedCategoryId = tab.dataset.categoryId;
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

// ===== 메뉴 그리드 =====
function renderMenuGrid() {
  const gridEl = document.getElementById("menuGrid");
  const menus = getMenusByCategory(selectedCategoryId);

  if (menus.length === 0) {
    gridEl.innerHTML = `<p class="empty-state">해당 카테고리에 메뉴가 없습니다.</p>`;
    return;
  }

  gridEl.innerHTML = menus
    .map(
      (menu) => `
        <a
          class="menu-card glass${menu.soldOut ? " sold-out" : ""}"
          href="detail.html?id=${encodeURIComponent(menu.id)}"
        >
          ${menu.soldOut ? `<span class="sold-out-badge">품절</span>` : ""}
          <div class="menu-card-image">☕</div>
          <div class="menu-card-body">
            <span class="menu-card-name">${menu.name}</span>
            <p class="menu-card-desc">${menu.description}</p>
            <span class="menu-card-price">${formatPrice(menu.price)}</span>
          </div>
        </a>
      `
    )
    .join("");
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
