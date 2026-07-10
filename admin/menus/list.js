const categoryFilter = document.getElementById("categoryFilter");
const keywordInput = document.getElementById("keywordInput");
const menuList = document.getElementById("menuList");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const soldOutCount = document.getElementById("soldOutCount");
const resultText = document.getElementById("resultText");

function initializeFilters() {
  const options = [{ id: "all", name: "전체" }, ...getCategories()];
  categoryFilter.innerHTML = options
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
}

function getFilteredMenus() {
  const categoryId = categoryFilter.value;
  const keyword = keywordInput.value.trim().toLowerCase();

  return getAllMenus().filter((menu) => {
    const matchesCategory = categoryId === "all" || menu.categoryId === categoryId;
    const source = `${menu.name} ${menu.description}`.toLowerCase();
    const matchesKeyword = !keyword || source.includes(keyword);
    return matchesCategory && matchesKeyword;
  });
}

function renderSummary() {
  const menus = getAllMenus();
  totalCount.textContent = menus.length;
  activeCount.textContent = menus.filter((menu) => !menu.soldOut).length;
  soldOutCount.textContent = menus.filter((menu) => menu.soldOut).length;
}

function renderList() {
  const menus = getFilteredMenus();
  resultText.textContent = `총 ${menus.length}개`;

  if (!menus.length) {
    menuList.innerHTML = `
      <div class="empty-state">
        조건에 맞는 메뉴가 없어요. 필터를 바꾸거나 새 메뉴를 등록해보세요.
      </div>
    `;
    return;
  }

  menuList.innerHTML = menus
    .map((menu) => {
      const category = getCategoryById(menu.categoryId);
      return `
        <article class="menu-card">
          <div class="menu-card-header">
            <div>
              <div class="menu-title-row">
                <h3>${menu.name}</h3>
                <span class="badge category">${category ? category.name : "미분류"}</span>
                ${menu.soldOut ? '<span class="badge soldout">품절</span>' : ""}
              </div>
              <p class="menu-description">${menu.description || "설명이 아직 없어요."}</p>
            </div>
            <span class="price">${formatPrice(menu.price)}</span>
          </div>

          <ul class="meta-list">
            <li>메뉴 ID: ${menu.id}</li>
            <li>이미지 경로: ${menu.image || "미등록"}</li>
          </ul>

          <div class="menu-card-footer">
            <a class="secondary-link" href="./detail.html?id=${encodeURIComponent(menu.id)}">상세 보기</a>
            <div class="action-group">
              <a class="action-button" href="./edit.html?id=${encodeURIComponent(menu.id)}">수정</a>
              <button class="action-button" type="button" data-action="toggle" data-id="${menu.id}">
                ${menu.soldOut ? "판매 재개" : "품절 처리"}
              </button>
              <button class="action-button warn" type="button" data-action="delete" data-id="${menu.id}">
                삭제
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function handleListClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!id) return;

  if (action === "toggle") {
    toggleMenuSoldOut(id);
    renderSummary();
    renderList();
    return;
  }

  if (action === "delete") {
    const menu = getMenuById(id);
    if (!menu) return;

    const confirmed = window.confirm(`"${menu.name}" 메뉴를 삭제할까요?`);
    if (!confirmed) return;

    deleteMenu(id);
    renderSummary();
    renderList();
  }
}

function initializePage() {
  initializeFilters();
  renderSummary();
  renderList();

  categoryFilter.addEventListener("change", renderList);
  keywordInput.addEventListener("input", renderList);
  menuList.addEventListener("click", handleListClick);
}

initializePage();
