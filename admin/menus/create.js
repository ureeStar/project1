const form = document.getElementById("menuForm");
const categorySelect = document.getElementById("categorySelect");
const message = document.getElementById("message");
const cancelButton = document.getElementById("cancelButton");

const previewName = document.getElementById("previewName");
const previewCategory = document.getElementById("previewCategory");
const previewStatus = document.getElementById("previewStatus");
const previewPrice = document.getElementById("previewPrice");
const previewDescription = document.getElementById("previewDescription");
const previewId = document.getElementById("previewId");
const previewImagePath = document.getElementById("previewImagePath");
const previewMedia = document.getElementById("previewMedia");

function renderCategoryOptions() {
  categorySelect.innerHTML = getCategories()
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
}

function getFormPayload() {
  const formData = new FormData(form);
  return {
    id: String(formData.get("id") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    categoryId: String(formData.get("categoryId") || ""),
    price: Number(formData.get("price")),
    image: String(formData.get("image") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    soldOut: formData.get("soldOut") === "on",
  };
}

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
  ["id", "name", "categoryId", "price", "image", "description"].forEach((fieldName) => {
    setFieldError(fieldName, errors[fieldName] || "");
  });
}

function renderPreview() {
  const payload = getFormPayload();
  const category = payload.categoryId ? getCategoryById(payload.categoryId) : null;

  previewName.textContent = payload.name || "메뉴 이름";
  previewCategory.textContent = category ? category.name : "카테고리";
  previewPrice.textContent = Number.isFinite(payload.price) && payload.price >= 0 ? formatPrice(payload.price) : "0원";
  previewDescription.textContent = payload.description || "설명이 아직 입력되지 않았습니다.";
  previewId.textContent = payload.id || "자동 생성";
  previewImagePath.textContent = payload.image || "미등록";

  previewStatus.textContent = payload.soldOut ? "품절" : "판매 중";
  previewStatus.className = `badge ${payload.soldOut ? "soldout" : "active"}`;

  previewMedia.innerHTML = payload.image
    ? `<img src="${payload.image}" alt="${payload.name || "메뉴 미리보기"}" />`
    : '<div class="preview-placeholder">Image Preview</div>';
}

function initializeValidation() {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      applyValidation(validateMenuForm(getFormPayload()));
      renderPreview();
      message.textContent = "";
    });

    field.addEventListener("change", () => {
      applyValidation(validateMenuForm(getFormPayload()));
      renderPreview();
      message.textContent = "";
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = getFormPayload();
  const errors = validateMenuForm(payload);
  applyValidation(errors);

  if (Object.keys(errors).length) {
    message.textContent = "입력값을 확인해 주세요.";
    return;
  }

  const createdMenu = createMenu(payload);
  window.location.href = `./detail.html?id=${encodeURIComponent(createdMenu.id)}`;
});

cancelButton.addEventListener("click", () => {
  window.location.href = "./list.html";
});

renderCategoryOptions();
initializeValidation();
renderPreview();
