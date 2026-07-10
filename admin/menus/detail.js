const content = document.getElementById("content");
const editLink = document.getElementById("editLink");
const params = new URLSearchParams(window.location.search);
const menuId = params.get("id");

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>메뉴를 찾을 수 없어요</h1>
      <p>삭제되었거나 잘못된 접근일 수 있습니다.</p>
    </section>
  `;
  editLink.style.display = "none";
}

function renderDetail(menu) {
  const category = getCategoryById(menu.categoryId);
  editLink.href = `./edit.html?id=${encodeURIComponent(menu.id)}`;

  content.innerHTML = `
    <section class="detail-card">
      <div class="detail-top">
        <div>
          <p class="eyebrow">Menu Detail</p>
          <div class="title-row">
            <h1>${menu.name}</h1>
            <span class="badge category">${category ? category.name : "미분류"}</span>
            ${menu.soldOut ? '<span class="badge soldout">품절</span>' : ""}
          </div>
          <p class="description">${menu.description || "설명이 아직 등록되지 않았습니다."}</p>
        </div>
        <div class="price">${formatPrice(menu.price)}</div>
      </div>

      <div class="detail-grid">
        <article class="info-box">
          <span>메뉴 ID</span>
          <strong>${menu.id}</strong>
        </article>
        <article class="info-box">
          <span>이미지 경로</span>
          <strong>${menu.image || "미등록"}</strong>
        </article>
        <article class="info-box">
          <span>판매 상태</span>
          <strong>${menu.soldOut ? "품절" : "판매 중"}</strong>
        </article>
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
