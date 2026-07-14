const CATEGORIES = [
  { id: "coffee", name: "커피" },
  { id: "tea", name: "티" },
  { id: "ade", name: "에이드" },
  { id: "dessert", name: "디저트" },
];

const MENUS = [
  { id: "americano", categoryId: "coffee", name: "아메리카노", price: 4500, description: "깔끔하고 깊은 풍미의 에스프레소 베이스 커피", image: "", soldOut: false },
  { id: "latte", categoryId: "coffee", name: "카페라떼", price: 5000, description: "부드러운 우유와 에스프레소의 조화", image: "", soldOut: false },
  { id: "cappuccino", categoryId: "coffee", name: "카푸치노", price: 5000, description: "풍성한 우유 거품이 매력적인 커피", image: "", soldOut: false },
  { id: "vanilla-latte", categoryId: "coffee", name: "바닐라라떼", price: 5500, description: "달콤한 바닐라 시럽을 더한 라떼", image: "", soldOut: false },
  { id: "earl-grey", categoryId: "tea", name: "얼그레이", price: 4800, description: "은은한 베르가못 향의 홍차", image: "", soldOut: false },
  { id: "peppermint", categoryId: "tea", name: "페퍼민트", price: 4800, description: "상쾌한 향의 허브티", image: "", soldOut: false },
  { id: "lemon-ade", categoryId: "ade", name: "레몬에이드", price: 5500, description: "상큼한 레몬으로 만든 탄산 에이드", image: "", soldOut: false },
  { id: "grapefruit-ade", categoryId: "ade", name: "자몽에이드", price: 5800, description: "새콤달콤한 자몽 과육이 가득한 에이드", image: "", soldOut: false },
  { id: "cheesecake", categoryId: "dessert", name: "치즈케이크", price: 6500, description: "진한 크림치즈의 부드러운 케이크", image: "", soldOut: false },
  { id: "croissant", categoryId: "dessert", name: "크루아상", price: 4200, description: "겹겹이 바삭한 버터 크루아상", image: "", soldOut: false },
];

const MENU_RECOMMENDATION_META = {
  americano: { isActive: true, recommendation: { moods: ["focused", "tired", "classic"], weathers: ["rainy", "cold", "cloudy"], tastes: ["bold", "clean", "bitter"], serving: "hot", caffeine: "high", decaf: true, popularity: 0.82 } },
  latte: { isActive: true, recommendation: { moods: ["calm", "comfort", "tired"], weathers: ["rainy", "cold", "cloudy"], tastes: ["creamy", "sweet", "soft"], serving: "hot", caffeine: "medium", decaf: true, popularity: 0.91 } },
  cappuccino: { isActive: true, recommendation: { moods: ["focused", "calm", "classic"], weathers: ["cold", "cloudy"], tastes: ["nutty", "rich", "bold"], serving: "hot", caffeine: "medium", decaf: false, popularity: 0.76 } },
  "vanilla-latte": { isActive: true, recommendation: { moods: ["cheerful", "comfort", "calm"], weathers: ["cold", "rainy", "cloudy"], tastes: ["sweet", "creamy", "soft"], serving: "hot", caffeine: "medium", decaf: true, popularity: 0.95 } },
  "earl-grey": { isActive: true, recommendation: { moods: ["calm", "classic", "focused"], weathers: ["rainy", "cloudy"], tastes: ["floral", "clean", "soft"], serving: "hot", caffeine: "low", decaf: false, popularity: 0.58 } },
  peppermint: { isActive: true, recommendation: { moods: ["calm", "refresh", "comfort"], weathers: ["hot", "cloudy", "rainy"], tastes: ["refreshing", "herbal", "clean"], serving: "cold", caffeine: "none", decaf: true, popularity: 0.49 } },
  "lemon-ade": { isActive: true, recommendation: { moods: ["refresh", "cheerful", "tired"], weathers: ["hot", "sunny"], tastes: ["citrus", "refreshing", "clean"], serving: "cold", caffeine: "none", decaf: true, popularity: 0.73 } },
  "grapefruit-ade": { isActive: true, recommendation: { moods: ["refresh", "cheerful", "bold"], weathers: ["hot", "sunny"], tastes: ["citrus", "tart", "refreshing"], serving: "cold", caffeine: "none", decaf: true, popularity: 0.78 } },
  cheesecake: { isActive: true, recommendation: { moods: ["comfort", "cheerful", "calm"], weathers: ["rainy", "cloudy", "cold"], tastes: ["sweet", "rich", "creamy"], serving: "cold", caffeine: "none", decaf: true, popularity: 0.65 } },
  croissant: { isActive: true, recommendation: { moods: ["classic", "comfort", "focused"], weathers: ["sunny", "cloudy", "cold"], tastes: ["buttery", "light", "savory"], serving: "warm", caffeine: "none", decaf: true, popularity: 0.61 } },
};

const ORDER_STATUSES = ["주문접수", "준비중", "완료"];

const ORDER_SEED = [
  { id: "ORD-20260701-001", createdAt: "2026-07-01T10:23:00", status: "완료", items: [{ menuId: "americano", quantity: 2 }, { menuId: "cheesecake", quantity: 1 }] },
  { id: "ORD-20260703-002", createdAt: "2026-07-03T14:05:00", status: "준비중", items: [{ menuId: "vanilla-latte", quantity: 1 }] },
  { id: "ORD-20260705-003", createdAt: "2026-07-05T09:40:00", status: "주문접수", items: [{ menuId: "lemon-ade", quantity: 2 }, { menuId: "croissant", quantity: 2 }] },
];

const SUPABASE_URL = "https://kymzmftzbyerjmgbvqas.supabase.co";
const SUPABASE_API_KEY = "sb_publishable_1LzORum3XE-IURXi7feIVg_QLaE7QF7";
const SUPABASE_SCHEMA = "public";
const ORDERS_STORAGE_KEY = "cafe-app:orders";

const DATA_CACHE = {
  categories: null,
  menus: null,
  orders: null,
  registeredUsers: null,
};

function supabaseRequestSync(method, table, query = "", body = null) {
  const xhr = new XMLHttpRequest();
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`;
  xhr.open(method, url, false);
  xhr.setRequestHeader("apikey", SUPABASE_API_KEY);
  xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_API_KEY}`);
  xhr.setRequestHeader("Accept-Profile", SUPABASE_SCHEMA);
  xhr.setRequestHeader("Content-Profile", SUPABASE_SCHEMA);
  xhr.setRequestHeader("Accept", "application/json");
  if (body !== null) {
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Prefer", "return=representation");
  }
  xhr.send(body === null ? null : JSON.stringify(body));

  if (xhr.status >= 200 && xhr.status < 300) {
    if (!xhr.responseText) {
      return [];
    }
    return JSON.parse(xhr.responseText);
  }

  throw new Error(`Supabase request failed: ${method} ${table} ${xhr.status}`);
}

function parseLocalJson(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createRecommendationMeta(meta = {}) {
  return {
    moods: Array.isArray(meta.moods) ? meta.moods : [],
    weathers: Array.isArray(meta.weathers) ? meta.weathers : [],
    tastes: Array.isArray(meta.tastes) ? meta.tastes : [],
    serving: meta.serving || null,
    caffeine: meta.caffeine || "medium",
    decaf: Boolean(meta.decaf),
    popularity: Number(meta.popularity) || 0,
  };
}

function normalizeMenu(menu) {
  const metaConfig = MENU_RECOMMENDATION_META[menu.id] || {};
  return {
    ...menu,
    isActive: menu.isActive !== undefined ? Boolean(menu.isActive) : metaConfig.isActive !== false,
    recommendation: createRecommendationMeta(menu.recommendation || metaConfig.recommendation),
  };
}

function mapDbMenu(row) {
  return normalizeMenu({
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    price: Number(row.price),
    description: row.description || "",
    image: row.image || "",
    soldOut: Boolean(row.sold_out),
    isActive: row.is_active !== false,
    recommendation: row.recommendation || {},
  });
}

function mapUiMenuToDb(menu) {
  return {
    id: menu.id,
    category_id: menu.categoryId,
    name: menu.name,
    price: Number(menu.price) || 0,
    description: menu.description || "",
    image: menu.image || "",
    sold_out: Boolean(menu.soldOut),
    is_active: menu.isActive !== false,
    recommendation: createRecommendationMeta(menu.recommendation),
  };
}

function mapDbOrder(orderRow, itemRows) {
  return {
    id: orderRow.id,
    createdAt: orderRow.created_at,
    status: orderRow.status,
    userId: orderRow.user_id || null,
    items: itemRows
      .filter((item) => item.order_id === orderRow.id)
      .map((item) => ({
        menuId: item.menu_id,
        quantity: item.quantity,
        temperature: item.temperature || null,
        size: item.size || null,
      })),
  };
}

function mapUiOrderToDb(order) {
  return {
    id: order.id,
    user_id: order.userId || null,
    status: order.status,
    created_at: order.createdAt,
  };
}

function normalizeLegacyOrder(order) {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    userId: order.userId || null,
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          menuId: item.menuId,
          quantity: Number(item.quantity) || 1,
          temperature: item.temperature || null,
          size: item.size || null,
        }))
      : [],
  };
}

function readLegacyOrders() {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  const parsed = parseLocalJson(raw, []);
  return Array.isArray(parsed) ? parsed.map(normalizeLegacyOrder).filter((order) => order.id) : [];
}

function syncOrderToDb(order) {
  const orderRows = supabaseRequestSync("GET", "orders", `select=id&id=eq.${encodeURIComponent(order.id)}`);
  if (orderRows.length) {
    supabaseRequestSync("PATCH", "orders", `id=eq.${encodeURIComponent(order.id)}`, mapUiOrderToDb(order));
    supabaseRequestSync("DELETE", "order_items", `order_id=eq.${encodeURIComponent(order.id)}`);
  } else {
    supabaseRequestSync("POST", "orders", "", mapUiOrderToDb(order));
  }

  order.items.forEach((item) => {
    supabaseRequestSync("POST", "order_items", "", {
      order_id: order.id,
      menu_id: item.menuId,
      quantity: item.quantity,
      temperature: item.temperature || null,
      size: item.size || null,
      created_at: order.createdAt,
    });
  });
}

function getSeedMenus() {
  return MENUS.map((menu) => normalizeMenu({ ...menu }));
}

function getMenuSeedOrderIndex(menuId) {
  const index = MENUS.findIndex((menu) => menu.id === menuId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function loadCategoriesFromDb() {
  try {
    const rows = supabaseRequestSync("GET", "categories", "select=*&order=id.asc");
    DATA_CACHE.categories = rows.map((row) => ({ id: row.id, name: row.name }));
  } catch {
    DATA_CACHE.categories = [...CATEGORIES];
  }
  return DATA_CACHE.categories;
}

function loadMenusFromDb() {
  try {
    const rows = supabaseRequestSync("GET", "menus", "select=*&order=id.asc");
    DATA_CACHE.menus = rows.map(mapDbMenu).sort((a, b) => getMenuSeedOrderIndex(a.id) - getMenuSeedOrderIndex(b.id));
  } catch {
    DATA_CACHE.menus = getSeedMenus();
  }
  return DATA_CACHE.menus;
}

function loadOrdersFromDb() {
  try {
    const orderRows = supabaseRequestSync("GET", "orders", "select=*&order=created_at.asc");
    const itemRows = supabaseRequestSync("GET", "order_items", "select=*&order=created_at.asc");
    const dbOrders = orderRows.map((row) => mapDbOrder(row, itemRows));
    const legacyOrders = readLegacyOrders();
    const mergedOrders = [...dbOrders];
    const existingIds = new Set(dbOrders.map((order) => order.id));

    legacyOrders.forEach((order) => {
      if (!existingIds.has(order.id)) {
        mergedOrders.push(order);
        existingIds.add(order.id);
        try {
          syncOrderToDb(order);
        } catch {
          // Keep legacy order available in UI even if migration fails.
        }
      }
    });

    DATA_CACHE.orders = mergedOrders;
  } catch {
    const legacyOrders = readLegacyOrders();
    DATA_CACHE.orders = [...ORDER_SEED.map((order) => ({
      ...order,
      userId: order.userId || null,
    })), ...legacyOrders.filter((order) => !ORDER_SEED.some((seed) => seed.id === order.id))];
  }
  return DATA_CACHE.orders;
}

function loadRegisteredUsersFromDb() {
  try {
    const rows = supabaseRequestSync("GET", "registered_users", "select=*&order=registered_at.asc");
    DATA_CACHE.registeredUsers = rows.map((row) => ({
      id: row.id,
      loginId: row.login_id,
      password: row.password,
      name: row.name,
      email: row.email || "",
      favoriteMenu: row.favorite_menu || "",
      registeredAt: row.registered_at,
    }));
  } catch {
    DATA_CACHE.registeredUsers = [];
  }
  return DATA_CACHE.registeredUsers;
}

function refreshOrdersCache() {
  DATA_CACHE.orders = null;
  return getOrders();
}

function refreshMenusCache() {
  DATA_CACHE.menus = null;
  return getAllMenus();
}

function refreshCategoriesCache() {
  DATA_CACHE.categories = null;
  return getCategories();
}

function refreshRegisteredUsersCache() {
  DATA_CACHE.registeredUsers = null;
  return getRegisteredUsers();
}

function getCategories() {
  return [...(DATA_CACHE.categories || loadCategoriesFromDb())];
}

function getAllMenus() {
  return [...(DATA_CACHE.menus || loadMenusFromDb())];
}

function saveMenus(menus) {
  menus.forEach((menu) => {
    const payload = mapUiMenuToDb(normalizeMenu(menu));
    supabaseRequestSync("POST", "menus", "", payload);
  });
  DATA_CACHE.menus = menus.map((menu) => normalizeMenu(menu));
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
  const nextMenu = normalizeMenu({
    id: menuInput.id || generateMenuId(menuInput.name),
    categoryId: menuInput.categoryId,
    name: menuInput.name,
    price: Number(menuInput.price),
    description: menuInput.description || "",
    image: menuInput.image || "",
    soldOut: Boolean(menuInput.soldOut),
    isActive: menuInput.isActive !== false,
    recommendation: createRecommendationMeta(menuInput.recommendation),
  });

  const payload = mapUiMenuToDb(nextMenu);
  const createdRows = supabaseRequestSync("POST", "menus", "", payload);
  const createdMenu = mapDbMenu(createdRows[0] || payload);
  refreshMenusCache();
  return createdMenu;
}

function updateMenu(menuId, menuInput) {
  const current = getMenuById(menuId);
  if (!current) {
    return null;
  }

  const nextMenu = normalizeMenu({
    ...current,
    ...menuInput,
    price: Number(menuInput.price ?? current.price),
    soldOut: Boolean(menuInput.soldOut),
  });

  const rows = supabaseRequestSync(
    "PATCH",
    "menus",
    `id=eq.${encodeURIComponent(menuId)}`,
    mapUiMenuToDb(nextMenu)
  );
  refreshMenusCache();
  return mapDbMenu(rows[0] || mapUiMenuToDb(nextMenu));
}

function deleteMenu(menuId) {
  supabaseRequestSync("DELETE", "menus", `id=eq.${encodeURIComponent(menuId)}`);
  const menus = getAllMenus().filter((menu) => menu.id !== menuId);
  DATA_CACHE.menus = menus;
  return menus;
}

function toggleMenuSoldOut(menuId) {
  const menu = getMenuById(menuId);
  if (!menu) return null;
  return updateMenu(menuId, { soldOut: !menu.soldOut });
}

function getCategoryById(categoryId) {
  return getCategories().find((category) => category.id === categoryId) || null;
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

function getOrders() {
  return [...(DATA_CACHE.orders || loadOrdersFromDb())];
}

function saveOrders(orders) {
  orders.forEach((order) => {
    syncOrderToDb(order);
  });

  DATA_CACHE.orders = orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item })),
  }));
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(DATA_CACHE.orders));
  return DATA_CACHE.orders;
}

function getOrderById(orderId) {
  return getOrders().find((order) => order.id === orderId) || null;
}

function getOrdersByUserId(userId) {
  if (!userId) {
    return [];
  }
  return getOrders().filter((order) => order.userId === userId);
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
  const rows = supabaseRequestSync("PATCH", "orders", `id=eq.${encodeURIComponent(orderId)}`, { status });
  refreshOrdersCache();
  return rows.length ? getOrderById(orderId) : null;
}

function getRegisteredUsers() {
  return [...(DATA_CACHE.registeredUsers || loadRegisteredUsersFromDb())];
}
