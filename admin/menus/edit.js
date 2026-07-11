const content = document.getElementById("content");
const detailLink = document.getElementById("detailLink");
const searchParams = new URLSearchParams(window.location.search);
const editMenuId = searchParams.get("id");

function validateMenuForm(data) {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = "메뉴명을 입력해 주세요.";
  }

  if (!data.categoryId) {
    errors.categoryId = "카테고리를 선택해 주세요.";
  }

  if (!Number.isFinite(data.price) || data.price < 0) {
    errors.price = "가격은 0원 이상으로 입력해 주세요.";
  }

  if (data.description.length > 200) {
    errors.description = "설명은 200자 이하로 입력해 주세요.";
  }

  return errors;
}

function renderMenuImage(image, name) {
  if (!image) {
    return '<div class="preview-placeholder">Image Preview</div>';
  }

  return `<img src="${image}" alt="${name}" />`;
}

function renderEmpty() {
  content.innerHTML = `
    <section class="empty-card">
      <h1>수정할 메뉴를 찾을 수 없습니다.</h1>
      <p>목록에서 다시 선택해 주세요.</p>
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
    <div class="form-layout">
      <section class="form-card">
        <div class="form-heading">
          <h2>메뉴 수정</h2>
          <p>고객 화면에 보일 이름, 가격, 이미지, 설명을 실시간 미리보기와 함께 조정할 수 있습니다.</p>
        </div>

        <form id="menuForm" class="menu-form" novalidate>
          <div class="field-grid">
            <label class="field">
              <span class="field-label">메뉴명</span>
              <input name="name" type="text" maxlength="30" required value="${menu.name}" />
              <small class="field-helper">메뉴 카드를 대표하는 노출 이름입니다.</small>
            </label>

            <label class="field">
              <span class="field-label">카테고리</span>
              <select name="categoryId" required>${categoryOptions}</select>
              <small class="field-helper">고객 탐색 필터와 관리자 목록에 함께 반영됩니다.</small>
            </label>

            <label class="field">
              <span class="field-label">가격</span>
              <input name="price" type="number" min="0" step="100" required value="${menu.price}" />
              <small class="field-helper">결제 금액과 목록 요약에 사용됩니다.</small>
            </label>

            <label class="field">
              <span class="field-label">이미지 경로</span>
              <input name="image" type="text" value="${menu.image || ""}" />
              <small class="field-helper">비워두면 기본 플레이스홀더가 표시됩니다.</small>
            </label>
          </div>

          <label class="field">
            <span class="field-label">설명</span>
            <textarea name="description" rows="5" maxlength="200">${menu.description || ""}</textarea>
            <small class="field-helper">브랜드 톤은 유지하되 고객이 빠르게 이해할 수 있게 작성하세요.</small>
          </label>

          <label class="field">
            <span class="field-label">메뉴 ID</span>
            <div class="readonly-box">${menu.id}</div>
            <small class="field-helper">기존 CRUD 연결을 위해 ID는 수정하지 않습니다.</small>
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

      <aside class="preview-panel glass" aria-label="메뉴 미리보기">
        <div class="preview-media" id="previewMedia">${renderMenuImage(menu.image, menu.name)}</div>
        <div class="preview-copy">
          <div class="preview-badges">
            <span class="badge category" id="previewCategory">${getCategoryById(menu.categoryId)?.name || "카테고리"}</span>
            <span class="badge ${menu.soldOut ? "soldout" : "active"}" id="previewStatus">${menu.soldOut ? "품절" : "판매 중"}</span>
          </div>
          <h2 id="previewName">${menu.name}</h2>
          <p class="preview-price" id="previewPrice">${formatPrice(menu.price)}</p>
          <p class="preview-description" id="previewDescription">${menu.description || "설명이 아직 입력되지 않았습니다."}</p>
          <div class="preview-meta">
            <div class="preview-meta-item">
              <span>메뉴 ID</span>
              <strong id="previewId">${menu.id}</strong>
            </div>
            <div class="preview-meta-item">
              <span>이미지 경로</span>
              <strong id="previewImagePath">${menu.image || "미등록"}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `;

  const form = document.getElementById("menuForm");
  const message = document.getElementById("message");
  const cancelButton = document.getElementById("cancelButton");
  const previewMedia = document.getElementById("previewMedia");
  const previewName = document.getElementById("previewName");
  const previewCategory = document.getElementById("previewCategory");
  const previewStatus = document.getElementById("previewStatus");
  const previewPrice = document.getElementById("previewPrice");
  const previewDescription = document.getElementById("previewDescription");
  const previewImagePath = document.getElementById("previewImagePath");

  function getPayload() {
    const formData = new FormData(form);
    return {
      name: String(formData.get("name") || "").trim(),
      categoryId: String(formData.get("categoryId") || ""),
      price: Number(formData.get("price")),
      image: String(formData.get("image") || "").trim(),
      description: String(formData.get("description") || "").trim(),
      soldOut: formData.get("soldOut") === "on",
    };
  }

  function setFieldError(fieldName, errorText) {
    const input = form.elements.namedItem(fieldName);
    if (!input) return;

    const field = input.closest(".field");
    if (!field) return;

    let errorEl = field.querySelector(".field-error");
    if (!errorEl) {
      errorEl = document.createElement("small");
      errorEl.className = "field-error";
      field.appendChild(errorEl);
    }

    field.classList.toggle("is-invalid", Boolean(errorText));
    input.setAttribute("aria-invalid", errorText ? "true" : "false");
    errorEl.textContent = errorText || "";
  }

  function applyValidation(errors) {
    ["name", "categoryId", "price", "image", "description"].forEach((fieldName) => {
      setFieldError(fieldName, errors[fieldName] || "");
    });
  }

  function renderPreview() {
    const payload = getPayload();
    const category = getCategoryById(payload.categoryId);

    previewName.textContent = payload.name || "메뉴 이름";
    previewCategory.textContent = category ? category.name : "카테고리";
    previewPrice.textContent =
      Number.isFinite(payload.price) && payload.price >= 0 ? formatPrice(payload.price) : "0원";
    previewDescription.textContent = payload.description || "설명이 아직 입력되지 않았습니다.";
    previewImagePath.textContent = payload.image || "미등록";
    previewStatus.textContent = payload.soldOut ? "품절" : "판매 중";
    previewStatus.className = `badge ${payload.soldOut ? "soldout" : "active"}`;
    previewMedia.innerHTML = renderMenuImage(payload.image, payload.name || menu.name);
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      applyValidation(validateMenuForm(getPayload()));
      renderPreview();
      message.textContent = "";
    });

    field.addEventListener("change", () => {
      applyValidation(validateMenuForm(getPayload()));
      renderPreview();
      message.textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = getPayload();
    const errors = validateMenuForm(payload);
    applyValidation(errors);

    if (Object.keys(errors).length) {
      message.textContent = "입력값을 확인해 주세요.";
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
