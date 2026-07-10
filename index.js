// ===== 인기 메뉴 =====
function renderFeaturedMenus() {
  const scrollEl = document.getElementById("featuredScroll");
  const menus = getAllMenus()
    .filter((menu) => !menu.soldOut)
    .slice(0, 6);

  if (menus.length === 0) {
    scrollEl.innerHTML = `<p class="empty-state">준비된 메뉴가 없습니다.</p>`;
    return;
  }

  scrollEl.innerHTML = menus
    .map(
      (menu) => `
        <a
          class="featured-card glass"
          href="menus/detail.html?id=${encodeURIComponent(menu.id)}"
        >
          <div class="featured-card-image">☕</div>
          <div class="featured-card-body">
            <span class="featured-card-name">${menu.name}</span>
            <span class="featured-card-price">${formatPrice(menu.price)}</span>
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

// ===== 초기화 =====
function init() {
  renderFeaturedMenus();
  updateCartBadge();
}

init();
