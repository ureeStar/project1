const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Non-Coffee",
  ade: "Non-Coffee",
  dessert: "Dessert",
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

  if (!menu.image) {
    return `<div class="featured-card-image" data-initial="${safeInitial}"></div>`;
  }

  return `
    <div class="featured-card-image" data-initial="${safeInitial}">
      <img src="${escapeHTML(menu.image)}" alt="${escapeHTML(menu.name)}" loading="lazy" />
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
