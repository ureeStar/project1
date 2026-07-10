const form = document.getElementById("menuForm");
const categorySelect = document.getElementById("categorySelect");
const message = document.getElementById("message");
const cancelButton = document.getElementById("cancelButton");

function renderCategoryOptions() {
  categorySelect.innerHTML = getCategories()
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
}

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

  const createdMenu = createMenu(payload);
  window.location.href = `./detail.html?id=${encodeURIComponent(createdMenu.id)}`;
});

cancelButton.addEventListener("click", () => {
  window.location.href = "./list.html";
});

renderCategoryOptions();
