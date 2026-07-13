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

function renderLoginRequired() {
  return `
    <section class="wishlist-login glass">
      <strong>찜한 메뉴를 확인하려면 로그인이 필요합니다.</strong>
      <p>로그인하면 저장해둔 메뉴를 이어서 볼 수 있어요.</p>
      <a href="../auth/login.html" id="wishlistLoginLink">로그인하기</a>
    </section>
  `;
}

function renderEmpty() {
  return `
    <section class="wishlist-empty">
      <strong>아직 찜한 메뉴가 없어요.</strong>
      <p>마음에 드는 메뉴를 저장해 보세요.</p>
      <a href="../menus/list.html">메뉴 보러 가기</a>
    </section>
  `;
}

function renderCard(item) {
  const menu = getMenuById(item.menuId);
  if (!menu) return "";

  return `
    <article class="wishlist-card">
      <a href="../menus/detail.html?id=${encodeURIComponent(menu.id)}">
        <img src="${escapeHTML(getMenuImage(menu))}" alt="${escapeHTML(menu.name)}" loading="lazy" />
      </a>
      <div class="wishlist-card-body">
        <h3>${escapeHTML(menu.name)}</h3>
        <span class="wishlist-price">${formatPrice(Number(menu.price) || 0)}</span>
        <div class="wishlist-actions">
          <a href="../menus/detail.html?id=${encodeURIComponent(menu.id)}">상세 보기</a>
          <button type="button" data-remove-wishlist="${escapeHTML(menu.id)}">삭제</button>
        </div>
      </div>
    </article>
  `;
}

function renderWishlist() {
  const contentEl = document.getElementById("wishlistContent");
  if (!contentEl) return;

  if (!isLoggedIn()) {
    contentEl.innerHTML = renderLoginRequired();
    document.getElementById("wishlistLoginLink").addEventListener("click", () => {
      setRedirectAfterLogin(window.location.href);
    });
    return;
  }

  const items = getWishlist().filter((item) => getMenuById(item.menuId));
  if (!items.length) {
    contentEl.innerHTML = renderEmpty();
    return;
  }

  contentEl.innerHTML = `<div class="wishlist-grid">${items.map(renderCard).join("")}</div>`;
}

function handleWishlistClick(event) {
  const button = event.target.closest("[data-remove-wishlist]");
  if (!button) return;

  removeWishlistItem(button.dataset.removeWishlist);
  showAppToast("찜 목록에서 해제됐어요.");
  renderWishlist();
}

function init() {
  initializeSharedCustomerUI();
  updateCartBadge();
  renderWishlist();
  document.getElementById("wishlistContent").addEventListener("click", handleWishlistClick);
}

init();
