// ===== 포맷 유틸리티 =====
function formatPrice(price) {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function getStatusClass(status) {
  if (status === "완료") return "status-done";
  if (status === "준비중") return "status-preparing";
  return "status-received";
}

// ===== 장바구니 유틸리티 (localStorage 기반) =====
const CART_STORAGE_KEY = "cafe-app:cart";

function normalizeCartItemOptions(options = {}) {
  return {
    temperature: options.temperature || null,
    size: options.size || null,
  };
}

function getCartItemKey(menuId, options = {}) {
  const normalized = normalizeCartItemOptions(options);
  return [
    menuId,
    normalized.temperature || "none",
    normalized.size || "none",
  ].join("::");
}

function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      const options = normalizeCartItemOptions(item);
      return {
        ...item,
        temperature: options.temperature,
        size: options.size,
      };
    });
  } catch {
    return [];
  }
}

function saveCart(cartItems) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function addToCart(menuId, quantity = 1, options = {}) {
  const cartItems = getCart();
  const nextOptions = normalizeCartItemOptions(options);
  const itemKey = getCartItemKey(menuId, nextOptions);
  const existing = cartItems.find((item) => getCartItemKey(item.menuId, item) === itemKey);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cartItems.push({
      menuId,
      quantity,
      temperature: nextOptions.temperature,
      size: nextOptions.size,
    });
  }

  saveCart(cartItems);
  return cartItems;
}

function updateCartItemQuantity(menuId, quantity, options = {}) {
  let cartItems = getCart();
  const itemKey = getCartItemKey(menuId, options);

  if (quantity <= 0) {
    cartItems = cartItems.filter((item) => getCartItemKey(item.menuId, item) !== itemKey);
  } else {
    const existing = cartItems.find((item) => getCartItemKey(item.menuId, item) === itemKey);
    if (existing) {
      existing.quantity = quantity;
    }
  }

  saveCart(cartItems);
  return cartItems;
}

function removeFromCart(menuId, options = {}) {
  const itemKey = getCartItemKey(menuId, options);
  const cartItems = getCart().filter((item) => getCartItemKey(item.menuId, item) !== itemKey);
  saveCart(cartItems);
  return cartItems;
}

function clearCart() {
  saveCart([]);
}

function getCartTotalCount() {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotalPrice(getMenuByIdFn) {
  return getCart().reduce((total, item) => {
    const menu = getMenuByIdFn(item.menuId);
    if (!menu) return total;
    return total + menu.price * item.quantity;
  }, 0);
}
