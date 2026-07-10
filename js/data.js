// ===== 카테고리 =====
const CATEGORIES = [
  { id: "coffee", name: "커피" },
  { id: "tea", name: "티" },
  { id: "ade", name: "에이드" },
  { id: "dessert", name: "디저트" },
];

// ===== 메뉴 =====
const MENUS = [
  {
    id: "americano",
    categoryId: "coffee",
    name: "아메리카노",
    price: 4500,
    description: "깔끔하고 깊은 풍미의 에스프레소 베이스 커피",
    image: "",
    soldOut: false,
  },
  {
    id: "latte",
    categoryId: "coffee",
    name: "카페라떼",
    price: 5000,
    description: "부드러운 우유와 에스프레소의 조화",
    image: "",
    soldOut: false,
  },
  {
    id: "cappuccino",
    categoryId: "coffee",
    name: "카푸치노",
    price: 5000,
    description: "풍성한 우유 거품이 매력적인 커피",
    image: "",
    soldOut: false,
  },
  {
    id: "vanilla-latte",
    categoryId: "coffee",
    name: "바닐라라떼",
    price: 5500,
    description: "달콤한 바닐라 시럽을 더한 라떼",
    image: "",
    soldOut: false,
  },
  {
    id: "earl-grey",
    categoryId: "tea",
    name: "얼그레이",
    price: 4800,
    description: "은은한 베르가못 향의 홍차",
    image: "",
    soldOut: false,
  },
  {
    id: "peppermint",
    categoryId: "tea",
    name: "페퍼민트",
    price: 4800,
    description: "상쾌한 향의 허브티",
    image: "",
    soldOut: false,
  },
  {
    id: "lemon-ade",
    categoryId: "ade",
    name: "레몬에이드",
    price: 5500,
    description: "상큼한 레몬으로 만든 탄산 에이드",
    image: "",
    soldOut: false,
  },
  {
    id: "grapefruit-ade",
    categoryId: "ade",
    name: "자몽에이드",
    price: 5800,
    description: "새콤달콤한 자몽 과육이 가득한 에이드",
    image: "",
    soldOut: false,
  },
  {
    id: "cheesecake",
    categoryId: "dessert",
    name: "치즈케이크",
    price: 6500,
    description: "진한 크림치즈의 부드러운 케이크",
    image: "",
    soldOut: false,
  },
  {
    id: "croissant",
    categoryId: "dessert",
    name: "크루아상",
    price: 4200,
    description: "겹겹이 바삭한 버터 크루아상",
    image: "",
    soldOut: false,
  },
];

const MENU_STORAGE_KEY = "cafe-app:menus";

function getCategories() {
  return [...CATEGORIES];
}

function getSeedMenus() {
  return MENUS.map((menu) => ({ ...menu }));
}

function getAllMenus() {
  const raw = localStorage.getItem(MENU_STORAGE_KEY);

  if (!raw) {
    const seedMenus = getSeedMenus();
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(seedMenus));
    return seedMenus;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid menu data");
    }
    return parsed;
  } catch {
    const seedMenus = getSeedMenus();
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(seedMenus));
    return seedMenus;
  }
}

function saveMenus(menus) {
  localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menus));
  return menus;
}

function generateMenuId(name) {
  const base = String(name || "menu")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "menu";

  const menus = getAllMenus();
  let nextId = base;
  let index = 2;

  while (menus.some((menu) => menu.id === nextId)) {
    nextId = `${base}-${index}`;
    index += 1;
  }

  return nextId;
}

function createMenu(menuInput) {
  const menus = getAllMenus();
  const nextMenu = {
    id: menuInput.id || generateMenuId(menuInput.name),
    categoryId: menuInput.categoryId,
    name: menuInput.name,
    price: Number(menuInput.price),
    description: menuInput.description || "",
    image: menuInput.image || "",
    soldOut: Boolean(menuInput.soldOut),
  };

  menus.push(nextMenu);
  saveMenus(menus);
  return nextMenu;
}

function updateMenu(menuId, menuInput) {
  const menus = getAllMenus();
  const index = menus.findIndex((menu) => menu.id === menuId);

  if (index === -1) {
    return null;
  }

  menus[index] = {
    ...menus[index],
    ...menuInput,
    price: Number(menuInput.price ?? menus[index].price),
    soldOut: Boolean(menuInput.soldOut),
  };

  saveMenus(menus);
  return menus[index];
}

function deleteMenu(menuId) {
  const menus = getAllMenus().filter((menu) => menu.id !== menuId);
  saveMenus(menus);
  return menus;
}

function toggleMenuSoldOut(menuId) {
  const menu = getMenuById(menuId);
  if (!menu) return null;
  return updateMenu(menuId, { soldOut: !menu.soldOut });
}

function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId) || null;
}

function getMenuById(menuId) {
  return getAllMenus().find((menu) => menu.id === menuId) || null;
}

function getMenusByCategory(categoryId) {
  if (!categoryId || categoryId === "all") {
    return getAllMenus();
  }
  return getAllMenus().filter((menu) => menu.categoryId === categoryId);
}

// ===== 주문 =====
const ORDER_STATUSES = ["주문접수", "준비중", "완료"];

const ORDERS_STORAGE_KEY = "cafe-app:orders";

const ORDER_SEED = [
  {
    id: "ORD-20260701-001",
    createdAt: "2026-07-01T10:23:00",
    status: "완료",
    items: [
      { menuId: "americano", quantity: 2 },
      { menuId: "cheesecake", quantity: 1 },
    ],
  },
  {
    id: "ORD-20260703-002",
    createdAt: "2026-07-03T14:05:00",
    status: "준비중",
    items: [{ menuId: "vanilla-latte", quantity: 1 }],
  },
  {
    id: "ORD-20260705-003",
    createdAt: "2026-07-05T09:40:00",
    status: "주문접수",
    items: [
      { menuId: "lemon-ade", quantity: 2 },
      { menuId: "croissant", quantity: 2 },
    ],
  },
];

function seedOrdersIfEmpty() {
  if (localStorage.getItem(ORDERS_STORAGE_KEY) === null) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ORDER_SEED));
  }
}

function getOrders() {
  seedOrdersIfEmpty();
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  return orders;
}

function getOrderById(orderId) {
  return getOrders().find((order) => order.id === orderId) || null;
}

function getOrderTotalPrice(order) {
  return order.items.reduce((total, item) => {
    const menu = getMenuById(item.menuId);
    if (!menu) return total;
    return total + menu.price * item.quantity;
  }, 0);
}

function getOrderSummaryText(order) {
  const firstMenu = getMenuById(order.items[0].menuId);
  const firstName = firstMenu ? firstMenu.name : "알 수 없는 메뉴";
  if (order.items.length > 1) {
    return `${firstName} 외 ${order.items.length - 1}건`;
  }
  return firstName;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  orders[index] = { ...orders[index], status };
  saveOrders(orders);
  return orders[index];
}
