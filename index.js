const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Non-Coffee",
  ade: "Non-Coffee",
  dessert: "Dessert",
};

const MENU_IMAGE_FALLBACKS = {
  americano: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80",
  latte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80",
  cappuccino: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=1200&q=80",
  "vanilla-latte": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80",
  "earl-grey": "https://images.unsplash.com/photo-1547825407-2d060104b7f8?auto=format&fit=crop&w=1200&q=80",
  peppermint: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80",
  "lemon-ade": "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80",
  "grapefruit-ade": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
  cheesecake: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=1200&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80",
};

const CATEGORY_INITIALS = {
  coffee: "C",
  tea: "N",
  ade: "N",
  dessert: "D",
};

const PREFERENCE_LABELS = {
  moods: {
    calm: "차분한 기분",
    focused: "집중하고 싶은 기분",
    tired: "피곤한 상태",
    cheerful: "기분 전환",
    comfort: "편안한 무드",
    classic: "클래식한 취향",
    refresh: "산뜻한 기분",
    bold: "강한 한 잔이 필요한 순간",
  },
  weathers: {
    sunny: "맑은 날씨",
    hot: "더운 날씨",
    rainy: "비 오는 날씨",
    cold: "쌀쌀한 날씨",
    cloudy: "흐린 날씨",
  },
  tastes: {
    sweet: "달콤한 맛",
    creamy: "부드러운 맛",
    bold: "진한 맛",
    clean: "깔끔한 맛",
    refreshing: "상큼한 맛",
    citrus: "시트러스 무드",
    nutty: "고소한 맛",
    rich: "묵직한 맛",
    bitter: "씁쓸한 맛",
    soft: "은은한 맛",
    floral: "향긋한 향",
    herbal: "허브 느낌",
    tart: "산미 있는 맛",
    buttery: "버터 풍미",
    light: "가벼운 식감",
    savory: "담백한 결",
  },
  temperatures: {
    hot: "따뜻한 음료",
    cold: "차가운 음료",
  },
  caffeine: {
    none: "카페인 없는 메뉴",
    low: "가벼운 카페인",
    medium: "적당한 카페인",
    high: "높은 카페인",
  },
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMenuImage(menu) {
  const initial = CATEGORY_INITIALS[menu.categoryId] || "M";
  const safeInitial = escapeHTML(initial);
  const imageUrl = menu.image || MENU_IMAGE_FALLBACKS[menu.id] || "";

  if (!imageUrl) {
    return `<div class="featured-card-image" data-initial="${safeInitial}"></div>`;
  }

  return `
    <div class="featured-card-image has-image" data-initial="${safeInitial}" data-menu-id="${escapeHTML(menu.id)}">
      <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(menu.name)}" loading="lazy" />
    </div>
  `;
}

function getAvailableMenus() {
  return getAllMenus().filter((menu) => !menu.soldOut && menu.isActive !== false);
}

function normalizeServing(serving) {
  if (serving === "warm") {
    return "hot";
  }

  return serving || null;
}

function getWeatherTemperatureMatch(weather) {
  if (weather === "sunny" || weather === "hot") {
    return "cold";
  }

  if (weather === "rainy" || weather === "cold") {
    return "hot";
  }

  return null;
}

function calculateRecommendationScore(menu, preferences) {
  const meta = menu.recommendation || {};
  const normalizedServing = normalizeServing(meta.serving);
  const matchedTastes = preferences.tastes.filter((taste) => meta.tastes.includes(taste));
  let score = 0;

  if (preferences.mood && meta.moods.includes(preferences.mood)) {
    score += 4;
  }

  if (preferences.weather && meta.weathers.includes(preferences.weather)) {
    score += 3;
  }

  if (matchedTastes.length) {
    score += matchedTastes.length * 2;
  }

  if (preferences.temperature && preferences.temperature === normalizedServing) {
    score += 2;
  }

  if (preferences.decaf && meta.decaf) {
    score += 4;
  }

  if ((preferences.mood === "focused" || preferences.mood === "tired") && ["medium", "high"].includes(meta.caffeine)) {
    score += 2;
  }

  if (preferences.weather && getWeatherTemperatureMatch(preferences.weather) === normalizedServing) {
    score += 2;
  }

  score += (Number(meta.popularity) || 0) * 0.35;

  return {
    score,
    matchedTastes,
    normalizedServing,
    popularity: Number(meta.popularity) || 0,
  };
}

function getRecommendedMenus(menus, preferences) {
  return menus
    .map((menu, index) => {
      const scoreData = calculateRecommendationScore(menu, preferences);
      return {
        menu,
        scoreData,
        originalIndex: index,
      };
    })
    .sort((a, b) => {
      if (b.scoreData.score !== a.scoreData.score) {
        return b.scoreData.score - a.scoreData.score;
      }

      if (b.scoreData.popularity !== a.scoreData.popularity) {
        return b.scoreData.popularity - a.scoreData.popularity;
      }

      return a.originalIndex - b.originalIndex;
    })
    .slice(0, 3);
}

function createRecommendationReason(menu, preferences, scoreData = null) {
  const meta = menu.recommendation || {};
  const resolvedScoreData = scoreData || calculateRecommendationScore(menu, preferences);
  const parts = [];

  if (preferences.mood && meta.moods.includes(preferences.mood)) {
    parts.push(`${PREFERENCE_LABELS.moods[preferences.mood] || "지금 기분"}에 잘 맞고`);
  }

  if (preferences.weather && meta.weathers.includes(preferences.weather)) {
    parts.push(`${PREFERENCE_LABELS.weathers[preferences.weather] || "오늘 날씨"}에 어울리며`);
  }

  if (resolvedScoreData.matchedTastes.length) {
    const firstTaste = resolvedScoreData.matchedTastes[0];
    parts.push(`${PREFERENCE_LABELS.tastes[firstTaste] || "선호하는 맛"}이 살아 있습니다`);
  }

  if (preferences.decaf && meta.decaf) {
    parts.push("디카페인 우선 선택에도 부담이 적습니다");
  }

  if (!parts.length && resolvedScoreData.normalizedServing) {
    parts.push(`${PREFERENCE_LABELS.temperatures[resolvedScoreData.normalizedServing] || "지금 무드"}으로 즐기기 좋습니다`);
  }

  const lead = parts.length ? parts.join(", ") : "오늘 취향을 무난하게 만족시키는 메뉴입니다";
  const caffeinePart =
    (preferences.mood === "focused" || preferences.mood === "tired") && meta.caffeine
      ? ` ${PREFERENCE_LABELS.caffeine[meta.caffeine] || "적당한 카페인"} 구성이어서 흐름을 이어가기 좋습니다.`
      : ".";

  return `${lead}.${caffeinePart}`.replace("..", ".");
}

function getCurrentPreferences() {
  const singleMood = document.querySelector('.preference-chip.is-active[data-preference-key="mood"]');
  const singleWeather = document.querySelector('.preference-chip.is-active[data-preference-key="weather"]');
  const singleTemperature = document.querySelector('.preference-chip.is-active[data-preference-key="temperature"]');
  const tastes = [...document.querySelectorAll('.preference-chip.is-active[data-preference-key="tastes"]')].map(
    (button) => button.dataset.preferenceValue
  );

  return {
    mood: singleMood ? singleMood.dataset.preferenceValue : null,
    weather: singleWeather ? singleWeather.dataset.preferenceValue : null,
    tastes,
    temperature: singleTemperature ? singleTemperature.dataset.preferenceValue : null,
    decaf: Boolean(document.getElementById("decafPreference")?.checked),
  };
}

function renderRecommendationEmpty(message) {
  const resultsEl = document.getElementById("recommendationResults");
  if (!resultsEl) return;

  resultsEl.innerHTML = `<div class="empty-state">${escapeHTML(message)}</div>`;
}

function renderRecommendationResults(preferences) {
  const resultsEl = document.getElementById("recommendationResults");
  const feedbackEl = document.getElementById("recommendationFeedback");
  if (!resultsEl || !feedbackEl) return;

  if (!preferences.mood || !preferences.weather) {
    feedbackEl.textContent = "기분과 날씨를 먼저 골라주시면 추천을 시작할게요.";
    renderRecommendationEmpty("선택한 취향을 바탕으로 최대 3개의 메뉴를 추천해 드립니다.");
    return;
  }

  const menus = getAvailableMenus();
  const recommendations = getRecommendedMenus(menus, preferences);

  if (!recommendations.length) {
    feedbackEl.textContent = "추천 가능한 메뉴를 찾지 못했어요.";
    renderRecommendationEmpty("현재 조건에 맞는 메뉴가 없습니다.");
    return;
  }

  feedbackEl.textContent = "선택한 조건과 메뉴 메타데이터를 기준으로 점수가 높은 순서대로 추천했어요.";

  resultsEl.innerHTML = recommendations
    .map(({ menu, scoreData }, rankIndex) => {
      const category = CATEGORY_LABELS[menu.categoryId] || "Seasonal";
      const isSaved = isWishlisted(menu.id);
      const reason = createRecommendationReason(menu, preferences, scoreData);

      return `
        <article class="featured-card recommendation-card">
          <a class="featured-card-link" href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">
            ${renderMenuImage(menu)}
            <div class="featured-card-body">
              <span class="recommendation-rank">Pick ${rankIndex + 1}</span>
              <span class="featured-card-category">${escapeHTML(category)}</span>
              <h3 class="featured-card-name">${escapeHTML(menu.name)}</h3>
              <p class="recommendation-reason">${escapeHTML(reason)}</p>
            </div>
          </a>
          <div class="featured-card-footer recommendation-footer">
            <span class="featured-card-price">${formatPrice(Number(menu.price) || 0)}</span>
            <div class="recommendation-actions">
              <button
                class="recommendation-action recommendation-action-secondary"
                type="button"
                data-recommendation-action="wish"
                data-menu-id="${escapeHTML(menu.id)}"
                aria-pressed="${isSaved ? "true" : "false"}"
              >
                ${isSaved ? "찜 완료" : "찜 저장"}
              </button>
              <button
                class="recommendation-action"
                type="button"
                data-recommendation-action="cart"
                data-menu-id="${escapeHTML(menu.id)}"
              >
                담기
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function handlePreferenceChipClick(event) {
  if (!(event.target instanceof Element)) return;

  const chip = event.target.closest(".preference-chip");
  if (!chip) return;

  const groupEl = chip.closest("[data-preference-group]");
  const selectionMode = groupEl?.dataset.selectionMode || "single";

  if (selectionMode === "single" && groupEl) {
    groupEl.querySelectorAll(".preference-chip").forEach((button) => {
      button.classList.toggle("is-active", button === chip);
      button.setAttribute("aria-pressed", button === chip ? "true" : "false");
    });
  } else {
    const nextState = !chip.classList.contains("is-active");
    chip.classList.toggle("is-active", nextState);
    chip.setAttribute("aria-pressed", nextState ? "true" : "false");
  }
}

function handleRecommendationSubmit() {
  renderRecommendationResults(getCurrentPreferences());
}

function handleRecommendationActionClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("[data-recommendation-action]");
  if (!button) return;

  const menuId = button.dataset.menuId;
  const action = button.dataset.recommendationAction;
  const menu = menuId ? getMenuById(menuId) : null;

  if (!menu || menu.soldOut || menu.isActive === false) {
    return;
  }

  if (action === "cart") {
    addToCart(menu.id, 1);
    updateCartBadge();
    showCartFeedback(menu.name);
    return;
  }

  if (action === "wish") {
    if (!isLoggedIn()) {
      showLoginRequiredModal({
        title: "로그인이 필요해요",
        message: "좋아요는 로그인 후 계정에 저장할 수 있습니다.",
        pendingAction: { type: "wishlist", menuId: menu.id },
      });
      return;
    }

    const result = toggleWishlistItem(menu);
    showAppToast(result.wishlisted ? `${menu.name}을 찜 목록에 저장했어요.` : `${menu.name}을 찜 목록에서 뺐어요.`);
    renderRecommendationResults(getCurrentPreferences());
  }
}

function renderFeaturedMenus() {
  const scrollEl = document.getElementById("featuredScroll");
  if (!scrollEl) return;

  const menus = getAvailableMenus().slice(0, 4);

  if (menus.length === 0) {
    scrollEl.innerHTML = `
      <p class="empty-state">준비한 메뉴가 없습니다. 잠시 후 다시 확인해 주세요.</p>
    `;
    return;
  }

  scrollEl.innerHTML = menus
    .map((menu) => {
      const category = CATEGORY_LABELS[menu.categoryId] || "Seasonal";

      return `
        <article class="featured-card">
          <a class="featured-card-link" href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">
            ${renderMenuImage(menu)}
            <div class="featured-card-body">
              <span class="featured-card-category">${escapeHTML(category)}</span>
              <h3 class="featured-card-name">${escapeHTML(menu.name)}</h3>
              <p class="featured-card-desc">${escapeHTML(menu.description || "매장에서 준비한 오늘의 메뉴")}</p>
            </div>
          </a>
          <div class="featured-card-footer">
            <span class="featured-card-price">${formatPrice(Number(menu.price) || 0)}</span>
            <button
              class="add-cart-button"
              type="button"
              data-menu-id="${escapeHTML(menu.id)}"
              aria-label="${escapeHTML(menu.name)} 장바구니 담기"
            >+</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateCartBadge() {
  const badgeEl = document.getElementById("cartBadge");
  if (!badgeEl) return;

  const count = getCartTotalCount();

  if (count > 0) {
    badgeEl.textContent = count > 99 ? "99+" : String(count);
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }
}

function showCartFeedback(menuName) {
  const feedbackEl = document.getElementById("cartFeedback");
  if (!feedbackEl) return;

  feedbackEl.textContent = `${menuName}을 장바구니에 담았습니다.`;

  window.clearTimeout(showCartFeedback.timer);
  showCartFeedback.timer = window.setTimeout(() => {
    feedbackEl.textContent = "";
  }, 1800);
}

function handleFeaturedClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest(".add-cart-button");
  if (!button) return;

  const menuId = button.dataset.menuId;
  const menu = menuId ? getMenuById(menuId) : null;
  if (!menu || menu.soldOut || menu.isActive === false) return;

  addToCart(menu.id, 1);
  updateCartBadge();
  showCartFeedback(menu.name);
}

function updateHeaderState() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  header.classList.toggle("scrolled", window.scrollY > 12);
}

function initRecommendationUI() {
  const formEl = document.getElementById("recommendationForm");
  const submitEl = document.getElementById("recommendationSubmit");
  const resultsEl = document.getElementById("recommendationResults");
  const decafEl = document.getElementById("decafPreference");

  if (formEl) {
    formEl.addEventListener("click", handlePreferenceChipClick);
  }

  if (submitEl) {
    submitEl.addEventListener("click", handleRecommendationSubmit);
  }

  if (resultsEl) {
    resultsEl.addEventListener("click", handleRecommendationActionClick);
  }

  if (decafEl) {
    decafEl.addEventListener("change", handleRecommendationSubmit);
  }

  renderRecommendationResults(getCurrentPreferences());
}

function init() {
  initializeSharedCustomerUI();
  const featuredEl = document.getElementById("featuredScroll");
  renderFeaturedMenus();
  initRecommendationUI();
  updateCartBadge();
  updateHeaderState();

  if (featuredEl) {
    featuredEl.addEventListener("click", handleFeaturedClick);
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

init();
