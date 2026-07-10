const MENU_IMAGE_FALLBACKS = {
  americano: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
  latte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  cappuccino: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80",
  "vanilla-latte": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  "earl-grey": "https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=900&q=80",
  peppermint: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80",
  "lemon-ade": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
  "grapefruit-ade": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
  cheesecake: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=900&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
};

const CATEGORY_NOTES = {
  all: "전체",
  coffee: "Coffee",
  tea: "Non-Coffee",
  ade: "Non-Coffee",
  dessert: "Dessert",
};

let selectedCategoryId = "all";
let searchKeyword = "";
let selectedSort = "featured";

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

function getCategoryName(categoryId) {
  const category = getCategoryById(categoryId);
  return CATEGORY_NOTES[categoryId] || (category ? category.name : "Seasonal");
}

function getInitialCategory() {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("category");
  return getCategories().some((category) => category.id === categoryId) ? categoryId : "all";
}

function init() {
  selectedCategoryId = getInitialCategory();
  bindControls();
  renderCategoryTabs();
  renderRecommendations();
  renderMenuGrid();
  updateCartBadge();
}

function bindControls() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const menuGrid = document.getElementById("menuGrid");
  const recommendMenuList = document.getElementById("recommendMenuList");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchKeyword = searchInput.value.trim().toLowerCase();
      renderMenuGrid();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      selectedSort = sortSelect.value;
      renderMenuGrid();
    });
  }

  if (menuGrid) {
    menuGrid.addEventListener("click", handleCartButtonClick);
  }

  if (recommendMenuList) {
    recommendMenuList.addEventListener("click", handleCartButtonClick);
  }
}

function renderCategoryTabs() {
  const tabsEl = document.getElementById("categoryTabs");
  if (!tabsEl) return;

  const allTabs = [{ id: "all", name: "전체" }, ...getCategories()];

  tabsEl.innerHTML = allTabs
    .map((category) => {
      const isActive = category.id === selectedCategoryId;
      return `
        <button
          class="category-tab${isActive ? " active" : ""}"
          type="button"
          data-category-id="${escapeHTML(category.id)}"
          aria-pressed="${isActive}"
        >
          <span>${escapeHTML(category.name)}</span>
        </button>
      `;
    })
    .join("");

  tabsEl.querySelectorAll(".category-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      selectedCategoryId = tab.dataset.categoryId || "all";
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

function getFilteredMenus() {
  const sourceMenus = getMenusByCategory(selectedCategoryId);
  const filteredMenus = sourceMenus.filter((menu) => {
    const searchSource = `${menu.name} ${menu.description} ${getCategoryName(menu.categoryId)}`.toLowerCase();
    return !searchKeyword || searchSource.includes(searchKeyword);
  });

  return filteredMenus.sort((a, b) => {
    if (selectedSort === "price-low") return a.price - b.price;
    if (selectedSort === "price-high") return b.price - a.price;
    if (selectedSort === "name") return a.name.localeCompare(b.name, "ko-KR");
    if (a.soldOut !== b.soldOut) return a.soldOut ? 1 : -1;
    return 0;
  });
}

function renderRecommendations() {
  const listEl = document.getElementById("recommendMenuList");
  if (!listEl) return;

  const menus = getAllMenus()
    .filter((menu) => !menu.soldOut)
    .slice(0, 3);

  if (!menus.length) {
    listEl.innerHTML = `<p class="empty-state compact">추천 가능한 메뉴가 없습니다.</p>`;
    return;
  }

  listEl.innerHTML = menus.map(renderRecommendCard).join("");
}

function renderRecommendCard(menu) {
  return `
    <article class="recommend-card">
      <a href="detail.html?id=${encodeURIComponent(menu.id)}">
        <img src="${escapeHTML(getMenuImage(menu))}" alt="${escapeHTML(menu.name)}" loading="lazy" />
        <span>
          <strong>${escapeHTML(menu.name)}</strong>
          <small>${formatPrice(menu.price)}</small>
        </span>
      </a>
      <button
        class="quick-cart-button"
        type="button"
        data-menu-id="${escapeHTML(menu.id)}"
        aria-label="${escapeHTML(menu.name)} 장바구니 담기"
      >+</button>
    </article>
  `;
}

function renderMenuGrid() {
  const gridEl = document.getElementById("menuGrid");
  const resultText = document.getElementById("resultText");
  if (!gridEl) return;

  const menus = getFilteredMenus();

  if (resultText) {
    resultText.textContent = `총 ${menus.length}개`;
  }

  if (menus.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <strong>검색 결과가 없습니다.</strong>
        <span>다른 키워드나 카테고리로 다시 찾아보세요.</span>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = menus.map(renderMenuCard).join("");
}

function renderMenuCard(menu) {
  const soldOut = Boolean(menu.soldOut);

  return `
    <article class="menu-card${soldOut ? " sold-out" : ""}">
      <a class="menu-card-link" href="detail.html?id=${encodeURIComponent(menu.id)}">
        <div class="menu-card-image">
          <img src="${escapeHTML(getMenuImage(menu))}" alt="${escapeHTML(menu.name)}" loading="lazy" />
          ${soldOut ? `<span class="sold-out-badge">품절</span>` : ""}
        </div>
        <div class="menu-card-body">
          <span class="menu-card-category">${escapeHTML(getCategoryName(menu.categoryId))}</span>
          <h3 class="menu-card-name">${escapeHTML(menu.name)}</h3>
          <p class="menu-card-desc">${escapeHTML(menu.description || "매장에서 준비한 메뉴입니다.")}</p>
        </div>
      </a>
      <div class="menu-card-footer">
        <span class="menu-card-price">${formatPrice(Number(menu.price) || 0)}</span>
        <button
          class="card-cart-button"
          type="button"
          data-menu-id="${escapeHTML(menu.id)}"
          ${soldOut ? "disabled" : ""}
          aria-label="${escapeHTML(menu.name)} 장바구니 담기"
        >${soldOut ? "품절" : "담기"}</button>
      </div>
    </article>
  `;
}

function handleCartButtonClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("[data-menu-id]");
  if (!button || button.disabled) return;

  const menuId = button.dataset.menuId;
  const menu = menuId ? getMenuById(menuId) : null;
  if (!menu || menu.soldOut) return;

  addToCart(menu.id, 1);
  updateCartBadge();
  showCartFeedback(`${menu.name}을(를) 장바구니에 담았습니다.`);
}

function showCartFeedback(message) {
  const feedbackEl = document.getElementById("cartFeedback");
  if (!feedbackEl) return;

  feedbackEl.textContent = message;
  feedbackEl.classList.add("show");

  window.clearTimeout(showCartFeedback.timer);
  showCartFeedback.timer = window.setTimeout(() => {
    feedbackEl.classList.remove("show");
    feedbackEl.textContent = "";
  }, 1800);
}

function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  if (!badgeEl) return;

  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

init();
