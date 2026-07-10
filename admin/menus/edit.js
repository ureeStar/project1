const content = document.getElementById("content");
const detailLink = document.getElementById("detailLink");
const searchParams = new URLSearchParams(window.location.search);
const editMenuId = searchParams.get("id");

function validateMenuForm(data) {
  if (!data.name.trim()) {
    return "메뉴명을 입력해주세요.";
  }

  if (!data.categoryId) {
    return "카테고리를 선택해주세요.";
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    return "가격은 0원 이상으로 입력해주세요.";
  }

  return "";
}

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>수정할 메뉴를 찾을 수 없어요</h1>
      <p>목록에서 다시 선택해주세요.</p>
    </section>
  `;
  detailLink.style.display = "none";
}

function renderForm(menu) {
  detailLink.href = `./detail.html?id=${encodeURIComponent(menu.id)}`;

  const categoryOptions = getCategories()
    .map(
      (category) =>
        `<option value="${category.id}" ${category.id === menu.categoryId ? "selected" : ""}>${category.name}</option>`
    )
    .join("");

  content.innerHTML = `
    <section class="form-card">
      <form id="menuForm" class="menu-form">
        <div class="field-grid">
          <label class="field">
            <span>메뉴명</span>
            <input name="name" type="text" maxlength="30" required value="${menu.name}" />
          </label>

          <label class="field">
            <span>카테고리</span>
            <select name="categoryId" required>${categoryOptions}</select>
          </label>

          <label class="field">
            <span>가격</span>
            <input name="price" type="number" min="0" step="100" required value="${menu.price}" />
          </label>

          <label class="field">
            <span>이미지 경로</span>
            <input name="image" type="text" value="${menu.image || ""}" />
          </label>
        </div>

        <label class="field">
          <span>설명</span>
          <textarea name="description" rows="5" maxlength="200">${menu.description || ""}</textarea>
        </label>

        <label class="field">
          <span>메뉴 ID</span>
          <div class="readonly-box">${menu.id}</div>
        </label>

        <label class="checkbox-field">
          <input name="soldOut" type="checkbox" ${menu.soldOut ? "checked" : ""} />
          <span>품절 상태로 표시</span>
        </label>

        <p id="message" class="message" aria-live="polite"></p>

        <div class="form-actions">
          <button class="secondary-button" type="button" id="cancelButton">취소</button>
          <button class="primary-button" type="submit">저장하기</button>
        </div>
      </form>
    </section>
  `;

  const form = document.getElementById("menuForm");
  const message = document.getElementById("message");
  const cancelButton = document.getElementById("cancelButton");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      categoryId: String(formData.get("categoryId") || ""),
      price: Number(formData.get("price")),
      image: String(formData.get("image") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      soldOut: formData.get("soldOut") === "on",
    };

    const error = validateMenuForm(payload);
    if (error) {
      message.textContent = error;
      return;
    }

    const updatedMenu = updateMenu(menu.id, payload);
    window.location.href = `./detail.html?id=${encodeURIComponent(updatedMenu.id)}`;
  });

  cancelButton.addEventListener("click", () => {
    window.location.href = `./detail.html?id=${encodeURIComponent(menu.id)}`;
  });
}

const menu = editMenuId ? getMenuById(editMenuId) : null;

if (!menu) {
  renderEmpty();
} else {
  renderForm(menu);
}
