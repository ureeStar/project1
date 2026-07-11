const categoryFilter = document.getElementById("categoryFilter");
const keywordInput = document.getElementById("keywordInput");
const menuListPanel = document.getElementById("menuListPanel");
const menuList = document.getElementById("menuList");
const menuTableShell = document.getElementById("menuTableShell");
const menuTableBody = document.getElementById("menuTableBody");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const soldOutCount = document.getElementById("soldOutCount");
const resultText = document.getElementById("resultText");
const viewButtons = Array.from(document.querySelectorAll("[data-view]"));

let currentView = "card";

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
    const source = `${menu.name} ${menu.description || ""} ${menu.id}`.toLowerCase();
    const matchesKeyword = !keyword || source.includes(keyword);
    return matchesCategory && matchesKeyword;
  });
}

function renderSummary() {
  const menus = getAllMenus();
  totalCount.textContent = String(menus.length);
  activeCount.textContent = String(menus.filter((menu) => !menu.soldOut).length);
  soldOutCount.textContent = String(menus.filter((menu) => menu.soldOut).length);
}

function renderImageMedia(image, label, className) {
  if (!image) {
    return `<div class="${className}"><div class="menu-media-placeholder">No Image</div></div>`;
  }

  return `<div class="${className}"><img src="${image}" alt="${label}" loading="lazy" /></div>`;
}

function renderCardList(menus) {
  if (!menus.length) {
    menuList.innerHTML = `
      <div class="empty-state">
        조건에 맞는 메뉴가 없습니다. 필터를 바꾸거나 새 메뉴를 등록해 보세요.
      </div>
    `;
    return;
  }

  menuList.innerHTML = menus
    .map((menu) => {
      const category = getCategoryById(menu.categoryId);
      return `
        <article class="menu-card">
          <div class="menu-card-main">
            ${renderImageMedia(menu.image, menu.name, "menu-media")}
            <div class="menu-copy">
              <div class="menu-card-header">
                <div>
                  <div class="menu-title-row">
                    <h3>${menu.name}</h3>
                    <div class="badge-stack">
                      <span class="badge category">${category ? category.name : "미분류"}</span>
                      <span class="badge ${menu.soldOut ? "soldout" : "active"}">${menu.soldOut ? "품절" : "판매 중"}</span>
                    </div>
                  </div>
                  <p class="menu-description">${menu.description || "설명이 아직 등록되지 않았습니다."}</p>
                </div>
                <div class="menu-side">
                  <span class="price">${formatPrice(menu.price)}</span>
                </div>
              </div>
              <div class="menu-meta">
                <div class="meta-chip">
                  <span class="meta-chip-label">메뉴 ID</span>
                  <span class="meta-chip-value">${menu.id}</span>
                </div>
                <div class="meta-chip">
                  <span class="meta-chip-label">이미지 경로</span>
                  <span class="meta-chip-value">${menu.image || "미등록"}</span>
                </div>
              </div>
            </div>
          </div>

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

function renderTableList(menus) {
  if (!menus.length) {
    menuTableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">조건에 맞는 메뉴가 없습니다. 다른 필터를 적용해 보세요.</div>
        </td>
      </tr>
    `;
    return;
  }

  menuTableBody.innerHTML = menus
    .map((menu) => {
      const category = getCategoryById(menu.categoryId);
      return `
        <tr>
          <td data-label="메뉴">
            <div class="table-menu-cell">
              ${renderImageMedia(menu.image, menu.name, "table-menu-thumb")}
              <div>
                <span class="table-menu-name">${menu.name}</span>
                <span class="table-menu-description">${menu.description || "설명이 아직 등록되지 않았습니다."}</span>
              </div>
            </div>
          </td>
          <td data-label="카테고리">${category ? category.name : "미분류"}</td>
          <td data-label="가격">${formatPrice(menu.price)}</td>
          <td data-label="상태"><span class="badge ${menu.soldOut ? "soldout" : "active"}">${menu.soldOut ? "품절" : "판매 중"}</span></td>
          <td data-label="이미지">${menu.image || "미등록"}</td>
          <td data-label="작업">
            <div class="table-action-group">
              <a class="action-button" href="./detail.html?id=${encodeURIComponent(menu.id)}">상세</a>
              <a class="action-button" href="./edit.html?id=${encodeURIComponent(menu.id)}">수정</a>
              <button class="action-button" type="button" data-action="toggle" data-id="${menu.id}">
                ${menu.soldOut ? "재개" : "품절"}
              </button>
              <button class="action-button warn" type="button" data-action="delete" data-id="${menu.id}">
                삭제
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function updateViewState() {
  const isCardView = currentView === "card";

  menuListPanel.dataset.view = currentView;
  menuList.hidden = !isCardView;
  menuTableShell.hidden = isCardView;
  menuList.classList.toggle("is-visible", isCardView);
  menuList.classList.toggle("is-hidden", !isCardView);
  menuTableShell.classList.toggle("is-visible", !isCardView);
  menuTableShell.classList.toggle("is-hidden", isCardView);

  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === currentView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function renderList() {
  const menus = getFilteredMenus();
  resultText.textContent = `총 ${menus.length}개`;

  renderCardList(menus);
  renderTableList(menus);
  updateViewState();
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

function handleViewChange(event) {
  const button = event.target.closest("[data-view]");
  if (!button) return;

  const nextView = button.dataset.view || "card";
  if (nextView === currentView) return;

  currentView = nextView;
  renderList();
}

function initializePage() {
  initializeFilters();
  renderSummary();
  renderList();

  categoryFilter.addEventListener("change", renderList);
  keywordInput.addEventListener("input", renderList);
  menuList.addEventListener("click", handleListClick);
  menuTableBody.addEventListener("click", handleListClick);
  viewButtons.forEach((button) => button.addEventListener("click", handleViewChange));
}

initializePage();
