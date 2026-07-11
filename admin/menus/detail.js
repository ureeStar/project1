const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const menuId = params.get("id");

function renderMenuImage(image, name) {
  if (!image) {
    return '<div class="detail-media-placeholder">Image Preview</div>';
  }

  return `<img src="${image}" alt="${name}" />`;
}

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>메뉴를 찾을 수 없습니다.</h1>
      <p>삭제되었거나 잘못된 경로로 접근했습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

function renderDetail(menu) {
  const category = getCategoryById(menu.categoryId);
  editLink.href = `./edit.html?id=${encodeURIComponent(menu.id)}`;

  content.innerHTML = `
    <section class="detail-card">
      <div class="detail-hero">
        <div class="detail-media">${renderMenuImage(menu.image, menu.name)}</div>
        <div class="detail-copy">
          <div class="detail-top">
            <div>
              <p class="eyebrow">Menu Detail</p>
              <div class="title-row">
                <h1>${menu.name}</h1>
                <div class="badge-stack">
                  <span class="badge category">${category ? category.name : "미분류"}</span>
                  <span class="badge ${menu.soldOut ? "soldout" : "active"}">${menu.soldOut ? "품절" : "판매 중"}</span>
                </div>
              </div>
            </div>
            <div class="price">${formatPrice(menu.price)}</div>
          </div>
          <p class="description">${menu.description || "설명이 아직 등록되지 않았습니다."}</p>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-main-grid">
          <article class="info-box">
            <span>메뉴 ID</span>
            <strong>${menu.id}</strong>
          </article>
          <article class="info-box">
            <span>카테고리</span>
            <strong>${category ? category.name : "미분류"}</strong>
          </article>
          <article class="info-box">
            <span>이미지 경로</span>
            <strong>${menu.image || "미등록"}</strong>
          </article>
          <article class="info-box">
            <span>노출 상태</span>
            <strong>${menu.soldOut ? "품절" : "판매 중"}</strong>
          </article>
        </div>
        <aside class="detail-aside-card">
          <span>운영 메모</span>
          <strong class="status-copy">${menu.soldOut ? "현재 고객 화면에서 주문할 수 없는 상태입니다." : "현재 고객 화면에서 정상 판매 중입니다."}</strong>
        </aside>
      </div>
    </section>
  `;
}

const menu = menuId ? getMenuById(menuId) : null;

if (!menu) {
  renderEmpty();
} else {
  renderDetail(menu);
}
