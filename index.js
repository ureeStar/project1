const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Non-Coffee",
  ade: "Non-Coffee",
  dessert: "Dessert",
};

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

const CATEGORY_INITIALS = {
  coffee: "C",
  tea: "N",
  ade: "N",
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

function renderMenuImage(menu) {
  const initial = CATEGORY_INITIALS[menu.categoryId] || "M";
  const safeInitial = escapeHTML(initial);
  const imageUrl = menu.image || MENU_IMAGE_FALLBACKS[menu.id] || "";

  if (!imageUrl) {
    return `<div class="featured-card-image" data-initial="${safeInitial}"></div>`;
  }

  return `
    <div class="featured-card-image has-image" data-initial="${safeInitial}" data-menu-id="${escapeHTML(menu.id)}">
      <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(menu.name)}" loading="lazy" />
    </div>
  `;
}

// ===== 추천 메뉴 =====
function renderFeaturedMenus() {
  const scrollEl = document.getElementById("featuredScroll");
  if (!scrollEl) return;

  const menus = getAllMenus()
    .filter((menu) => !menu.soldOut)
    .slice(0, 4);

  if (menus.length === 0) {
    scrollEl.innerHTML = `
      <p class="empty-state">준비된 메뉴가 없습니다. 잠시 후 다시 확인해주세요.</p>
    `;
    return;
  }

  scrollEl.innerHTML = menus
    .map((menu) => {
      const category = CATEGORY_LABELS[menu.categoryId] || "Seasonal";

      return `
        <article class="featured-card">
          <a class="featured-card-link" href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">
            ${renderMenuImage(menu)}
            <div class="featured-card-body">
              <span class="featured-card-category">${escapeHTML(category)}</span>
              <h3 class="featured-card-name">${escapeHTML(menu.name)}</h3>
              <p class="featured-card-desc">${escapeHTML(menu.description || "매장에서 준비한 오늘의 메뉴")}</p>
            </div>
          </a>
          <div class="featured-card-footer">
            <span class="featured-card-price">${formatPrice(Number(menu.price) || 0)}</span>
            <button
              class="add-cart-button"
              type="button"
              data-menu-id="${escapeHTML(menu.id)}"
              aria-label="${escapeHTML(menu.name)} 장바구니 담기"
            >+</button>
          </div>
        </article>
      `;
    })
    .join("");
}

// ===== 장바구니 배지 =====
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

function showCartFeedback(menuName) {
  const feedbackEl = document.getElementById("cartFeedback");
  if (!feedbackEl) return;

  feedbackEl.textContent = `${menuName}을(를) 장바구니에 담았습니다.`;

  window.clearTimeout(showCartFeedback.timer);
  showCartFeedback.timer = window.setTimeout(() => {
    feedbackEl.textContent = "";
  }, 1800);
}

function handleFeaturedClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(".add-cart-button");
  if (!button) return;

  const menuId = button.dataset.menuId;
  const menu = menuId ? getMenuById(menuId) : null;
  if (!menu || menu.soldOut) return;

  addToCart(menu.id, 1);
  updateCartBadge();
  showCartFeedback(menu.name);
}

function updateHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  header.classList.toggle("scrolled", window.scrollY > 12);
}

// ===== 초기화 =====
function init() {
  initializeSharedCustomerUI();
  const featuredEl = document.getElementById("featuredScroll");
  renderFeaturedMenus();
  updateCartBadge();
  updateHeaderState();

  if (featuredEl) {
    featuredEl.addEventListener("click", handleFeaturedClick);
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

init();
