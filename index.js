const CATEGORY_LABELS = {
  coffee: "Coffee",
  tea: "Tea",
  ade: "Ade",
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
  tea: "T",
  ade: "A",
  dessert: "D",
};

const WIZARD_STEPS = [
  {
    title: "지금 기분을 골라주세요",
    requiredKey: "mood",
    validate(preferences) {
      return Boolean(preferences.mood);
    },
    message: "먼저 지금 기분에 가장 가까운 항목을 하나 골라주세요.",
  },
  {
    title: "오늘 날씨를 알려주세요",
    requiredKey: "weather",
    validate(preferences) {
      return Boolean(preferences.weather);
    },
    message: "날씨를 고르면 온도감까지 더 잘 맞춰 추천할 수 있어요.",
  },
  {
    title: "취향을 조금만 더 알려주세요",
    requiredKey: "tastes",
    validate(preferences) {
      return preferences.tastes.length > 0 || preferences.decaf || Boolean(preferences.temperature);
    },
    message: "마지막 단계에서는 취향을 하나 이상 선택해주세요.",
  },
];

const MOOD_TO_META = {
  tired: "tired",
  cheerful: "cheerful",
  refresh: "calm",
  comfort: "comfort",
  focused: "focused",
};

const TASTE_TO_META = {
  sweet: "sweet",
  nutty: "nutty",
  citrus: "citrus",
  bold: "bold",
  creamy: "creamy",
};

const TEMPERATURE_TO_META = {
  cold: "cold",
  hot: "hot",
};

let currentWizardStep = 1;

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
  const metaMood = preferences.mood ? MOOD_TO_META[preferences.mood] || preferences.mood : null;
  const matchedTastes = preferences.tastes.filter((taste) => meta.tastes.includes(taste));
  let score = 0;

  if (metaMood && meta.moods.includes(metaMood)) {
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

  if ((metaMood === "focused" || metaMood === "tired") && ["medium", "high"].includes(meta.caffeine)) {
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
    .map((menu, index) => ({
      menu,
      scoreData: calculateRecommendationScore(menu, preferences),
      originalIndex: index,
    }))
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
  const mood = preferences.mood ? MOOD_TO_META[preferences.mood] || preferences.mood : null;

  if (mood && meta.moods.includes(mood)) {
    const moodLabelMap = {
      tired: "지친 순간에 부담 없이 힘을 보태고",
      cheerful: "달콤한 기분 전환이 필요한 순간과 잘 어울리고",
      calm: "가볍고 맑은 흐름으로 즐기기 좋고",
      comfort: "편안하게 쉬고 싶은 흐름에 잘 맞고",
      focused: "집중이 필요한 시간대와 잘 어울리고",
    };
    parts.push(moodLabelMap[mood] || "오늘의 기분과 잘 어울리고");
  }

  if (preferences.weather && meta.weathers.includes(preferences.weather)) {
    const weatherLabelMap = {
      sunny: "맑은 날의 리듬과 자연스럽게 이어집니다",
      hot: "더운 날씨에 산뜻하게 마시기 좋습니다",
      cold: "차가운 바깥 공기 속에서 만족감이 좋습니다",
      rainy: "비 오는 날에 특히 잘 어울립니다",
      cloudy: "흐린 날에도 무겁지 않게 즐길 수 있습니다",
    };
    parts.push(weatherLabelMap[preferences.weather] || "오늘 날씨와도 잘 맞습니다");
  }

  if (resolvedScoreData.matchedTastes.length) {
    const tasteLabelMap = {
      sweet: "달콤한 결이 또렷하고",
      nutty: "고소한 여운이 살아 있고",
      citrus: "산뜻한 산미가 깔끔하게 남고",
      bold: "진한 바디감이 분명하고",
      creamy: "부드러운 질감이 편안하게 이어집니다",
    };
    const firstTaste = resolvedScoreData.matchedTastes[0];
    parts.push(tasteLabelMap[firstTaste] || "선택한 취향과 잘 맞습니다");
  }

  if (preferences.decaf && meta.decaf) {
    parts.push("디카페인으로도 편하게 즐길 수 있습니다");
  }

  if (!parts.length && resolvedScoreData.normalizedServing) {
    parts.push(
      resolvedScoreData.normalizedServing === "cold"
        ? "지금 마시기 좋은 차가운 템포를 가지고 있습니다"
        : "오늘 한 잔으로 만족감이 높은 따뜻한 메뉴입니다"
    );
  }

  return `${parts.join(". ")}.`.replace(/\.\./g, ".");
}

function getCurrentPreferences() {
  const moodButton = document.querySelector('.preference-chip.is-active[data-preference-key="mood"]');
  const weatherButton = document.querySelector('.preference-chip.is-active[data-preference-key="weather"]');
  const selectedTasteValues = [...document.querySelectorAll('.preference-chip.is-active[data-preference-key="tastes"]')].map(
    (button) => button.dataset.preferenceValue
  );

  const tastes = selectedTasteValues
    .filter((value) => !["decaf", "cold", "hot"].includes(value))
    .map((value) => TASTE_TO_META[value] || value);

  const temperature = selectedTasteValues.find((value) => value === "cold" || value === "hot");

  return {
    mood: moodButton ? moodButton.dataset.preferenceValue : null,
    weather: weatherButton ? weatherButton.dataset.preferenceValue : null,
    tastes,
    temperature: temperature ? TEMPERATURE_TO_META[temperature] || temperature : null,
    decaf: selectedTasteValues.includes("decaf"),
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function smoothScrollTo(element) {
  if (!element) return;
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function getStepFeedback(stepNumber) {
  return WIZARD_STEPS[stepNumber - 1]?.message || "";
}

function setRecommendationFeedback(message) {
  const feedbackEl = document.getElementById("recommendationFeedback");
  if (feedbackEl) {
    feedbackEl.textContent = message;
  }
}

function renderRecommendationEmpty(message) {
  const resultsEl = document.getElementById("recommendationResults");
  if (!resultsEl) return;
  resultsEl.innerHTML = `<div class="empty-state">${escapeHTML(message)}</div>`;
}

function renderRecommendationResults(preferences) {
  const resultsWrapEl = document.getElementById("recommendationResultsWrap");
  const resultsEl = document.getElementById("recommendationResults");
  if (!resultsEl || !resultsWrapEl) return;

  const menus = getAvailableMenus();
  const recommendations = getRecommendedMenus(menus, preferences);

  resultsWrapEl.hidden = false;

  if (!recommendations.length) {
    setRecommendationFeedback("지금 조건으로 추천할 수 있는 메뉴를 찾지 못했어요.");
    renderRecommendationEmpty("현재 선택으로는 추천 가능한 메뉴가 없습니다.");
    smoothScrollTo(resultsWrapEl);
    return;
  }

  setRecommendationFeedback("지금 선택한 취향을 바탕으로 가장 잘 어울리는 메뉴를 골랐어요.");

  resultsEl.innerHTML = recommendations
    .map(({ menu, scoreData }, index) => {
      const category = CATEGORY_LABELS[menu.categoryId] || "Seasonal";
      const isSaved = isWishlisted(menu.id);
      const reason = createRecommendationReason(menu, preferences, scoreData);
      const badge = index === 0 ? "Best Match" : `Pick ${index + 1}`;

      return `
        <article class="featured-card recommendation-card${index === 0 ? " is-best-match" : ""}">
          <a class="featured-card-link" href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">
            ${renderMenuImage(menu)}
            <div class="featured-card-body">
              <span class="recommendation-rank${index === 0 ? " badge" : ""}">${badge}</span>
              <span class="featured-card-category">${escapeHTML(category)}</span>
              <h3 class="featured-card-name">${escapeHTML(menu.name)}</h3>
              <p class="featured-card-desc">${escapeHTML(menu.description || "오늘 추천하는 메뉴입니다.")}</p>
              <p class="recommendation-reason">${escapeHTML(reason)}</p>
            </div>
          </a>
          <div class="featured-card-footer recommendation-footer">
            <span class="featured-card-price">${formatPrice(Number(menu.price) || 0)}</span>
            <div class="recommendation-actions">
              <a class="recommendation-action recommendation-action-secondary" href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">상세 보기</a>
              <button
                class="recommendation-action recommendation-action-secondary"
                type="button"
                data-recommendation-action="wish"
                data-menu-id="${escapeHTML(menu.id)}"
                aria-pressed="${isSaved ? "true" : "false"}"
              >
                ${isSaved ? "좋아요 취소" : "좋아요"}
              </button>
              <button
                class="recommendation-action"
                type="button"
                data-recommendation-action="cart"
                data-menu-id="${escapeHTML(menu.id)}"
              >
                장바구니
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  smoothScrollTo(resultsWrapEl);
}

function updateWizardUI() {
  const stepLabelEl = document.getElementById("recommendationStepLabel");
  const stepTitleEl = document.getElementById("recommendationStepTitle");
  const progressFillEl = document.getElementById("recommendationProgressbarFill");
  const prevButtonEl = document.getElementById("recommendationPrev");
  const nextButtonEl = document.getElementById("recommendationNext");
  const submitButtonEl = document.getElementById("recommendationSubmit");

  document.querySelectorAll(".recommendation-stage").forEach((stageEl) => {
    const step = Number(stageEl.dataset.step);
    const isActive = step === currentWizardStep;
    stageEl.classList.toggle("is-active", isActive);
    stageEl.hidden = !isActive;
  });

  if (stepLabelEl) {
    stepLabelEl.textContent = `${currentWizardStep} / ${WIZARD_STEPS.length} 단계`;
  }

  if (stepTitleEl) {
    stepTitleEl.textContent = WIZARD_STEPS[currentWizardStep - 1].title;
  }

  if (progressFillEl) {
    progressFillEl.style.width = `${(currentWizardStep / WIZARD_STEPS.length) * 100}%`;
  }

  if (prevButtonEl) {
    prevButtonEl.disabled = currentWizardStep === 1;
  }

  if (nextButtonEl) {
    nextButtonEl.hidden = currentWizardStep === WIZARD_STEPS.length;
  }

  if (submitButtonEl) {
    submitButtonEl.hidden = currentWizardStep !== WIZARD_STEPS.length;
  }
}

function validateCurrentStep(showMessage = false) {
  const preferences = getCurrentPreferences();
  const currentStepConfig = WIZARD_STEPS[currentWizardStep - 1];
  const isValid = currentStepConfig.validate(preferences);

  if (!isValid && showMessage) {
    setRecommendationFeedback(currentStepConfig.message);
  }

  return isValid;
}

function resetRecommendationSelections() {
  document.querySelectorAll(".preference-chip").forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });

  currentWizardStep = 1;
  updateWizardUI();
  setRecommendationFeedback("세 단계로 취향을 골라보면 오늘 어울리는 메뉴를 바로 추천해드릴게요.");

  const resultsWrapEl = document.getElementById("recommendationResultsWrap");
  if (resultsWrapEl) {
    resultsWrapEl.hidden = true;
  }

  renderRecommendationEmpty("기분, 날씨, 취향을 차례로 고르면 최대 3개의 메뉴를 추천해드립니다.");
}

function handlePreferenceChipClick(event) {
  if (!(event.target instanceof Element)) return;

  const chip = event.target.closest(".preference-chip");
  if (!chip) return;

  const groupEl = chip.closest("[data-preference-group]");
  const selectionMode = groupEl?.dataset.selectionMode || "single";

  if (selectionMode === "single" && groupEl) {
    groupEl.querySelectorAll(".preference-chip").forEach((button) => {
      const isActive = button === chip;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  } else {
    const nextState = !chip.classList.contains("is-active");
    chip.classList.toggle("is-active", nextState);
    chip.setAttribute("aria-pressed", nextState ? "true" : "false");
  }

  setRecommendationFeedback("");
}

function handleRecommendationNext() {
  if (!validateCurrentStep(true)) {
    return;
  }

  if (currentWizardStep < WIZARD_STEPS.length) {
    currentWizardStep += 1;
    updateWizardUI();
    setRecommendationFeedback(getStepFeedback(currentWizardStep));
  }
}

function handleRecommendationPrev() {
  if (currentWizardStep > 1) {
    currentWizardStep -= 1;
    updateWizardUI();
    setRecommendationFeedback(getStepFeedback(currentWizardStep));
  }
}

function handleRecommendationSubmit() {
  if (!validateCurrentStep(true)) {
    return;
  }

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
        message: "좋아요 목록은 로그인한 계정에 저장됩니다.",
        pendingAction: { type: "wishlist", menuId: menu.id },
      });
      return;
    }

    const result = toggleWishlistItem(menu);
    showAppToast(result.wishlisted ? `${menu.name}을 좋아요에 담았어요.` : `${menu.name}을 좋아요에서 뺐어요.`);

    if (button.closest("#todayMenuCard")) {
      renderTodayMenu();
    } else {
      renderRecommendationResults(getCurrentPreferences());
    }
  }
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getTodayMenu(menus) {
  if (!menus.length) {
    return null;
  }

  const sortedMenus = [...menus].sort((a, b) => a.id.localeCompare(b.id));
  const dateKey = getLocalDateKey();
  const index = hashString(dateKey) % sortedMenus.length;
  return sortedMenus[index];
}

function getTodayMenuReason(menu) {
  const meta = menu.recommendation || {};
  const reasonParts = [];

  if (meta.moods?.length) {
    const moodReasonMap = {
      calm: "부담 없이 시작하기 좋은 잔",
      focused: "집중이 필요한 시간대에 잘 맞는 잔",
      tired: "지친 흐름을 가볍게 깨워주는 잔",
      cheerful: "기분을 환하게 바꿔주는 잔",
      comfort: "천천히 쉬고 싶을 때 어울리는 잔",
    };
    reasonParts.push(moodReasonMap[meta.moods[0]] || "오늘 고르기 좋은 메뉴");
  }

  if (meta.tastes?.length) {
    const tasteReasonMap = {
      sweet: "달콤한 결이 자연스럽게 이어집니다",
      creamy: "부드러운 질감이 만족감을 더합니다",
      bold: "진한 바디감이 또렷합니다",
      clean: "깔끔한 피니시가 매력입니다",
      refreshing: "산뜻한 템포로 즐기기 좋습니다",
      citrus: "상큼한 인상이 분명합니다",
      nutty: "고소한 향이 편안하게 남습니다",
      rich: "깊은 여운이 길게 이어집니다",
    };
    reasonParts.push(tasteReasonMap[meta.tastes[0]] || "오늘의 무드에 잘 어울립니다");
  }

  if (normalizeServing(meta.serving) === "cold") {
    reasonParts.push("차갑게 마셨을 때 매력이 더 잘 살아납니다");
  } else if (normalizeServing(meta.serving) === "hot") {
    reasonParts.push("따뜻하게 즐길 때 향이 더욱 또렷합니다");
  }

  return `${reasonParts.slice(0, 2).join(". ")}.` || "오늘의 메뉴로 고른 한 잔입니다.";
}

function renderTodayMenu() {
  const cardEl = document.getElementById("todayMenuCard");
  const dateLabelEl = document.getElementById("todayMenuDateLabel");
  if (!cardEl) return;

  const menus = getAvailableMenus();
  const todayMenu = getTodayMenu(menus);

  if (dateLabelEl) {
    const now = new Date();
    dateLabelEl.textContent = `${now.getMonth() + 1}월 ${now.getDate()}일의 추천`;
  }

  if (!todayMenu) {
    cardEl.innerHTML = `<div class="empty-state">오늘의 메뉴를 준비 중입니다.</div>`;
    return;
  }

  const isSaved = isWishlisted(todayMenu.id);
  const category = CATEGORY_LABELS[todayMenu.categoryId] || "Seasonal";
  const todayReason = getTodayMenuReason(todayMenu);

  cardEl.innerHTML = `
    <article class="today-menu-layout">
      <a class="today-menu-media" href="./menus/detail.html?id=${encodeURIComponent(todayMenu.id)}">
        ${renderMenuImage(todayMenu)}
      </a>
      <div class="today-menu-body">
        <span class="recommendation-rank badge">Today&apos;s Menu</span>
        <span class="featured-card-category">${escapeHTML(category)}</span>
        <h3 class="featured-card-name">${escapeHTML(todayMenu.name)}</h3>
        <p class="featured-card-desc">${escapeHTML(todayMenu.description || "오늘의 메뉴로 추천하는 한 잔입니다.")}</p>
        <p class="today-menu-reason">${escapeHTML(todayReason)}</p>
        <div class="today-menu-meta">
          <span>${formatPrice(Number(todayMenu.price) || 0)}</span>
          <span>품절 아님</span>
          <span>매장 추천</span>
        </div>
        <div class="today-menu-actions">
          <a class="recommendation-action recommendation-action-secondary" href="./menus/detail.html?id=${encodeURIComponent(todayMenu.id)}">상세 보기</a>
          <button
            class="recommendation-action recommendation-action-secondary"
            type="button"
            data-recommendation-action="wish"
            data-menu-id="${escapeHTML(todayMenu.id)}"
            aria-pressed="${isSaved ? "true" : "false"}"
          >
            ${isSaved ? "좋아요 취소" : "좋아요"}
          </button>
          <button
            class="recommendation-action"
            type="button"
            data-recommendation-action="cart"
            data-menu-id="${escapeHTML(todayMenu.id)}"
          >
            장바구니
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedMenus() {
  const scrollEl = document.getElementById("featuredScroll");
  if (!scrollEl) return;

  const menus = getAvailableMenus().slice(0, 4);

  if (!menus.length) {
    scrollEl.innerHTML = `<p class="empty-state">준비한 메뉴가 없습니다. 잠시 후 다시 확인해주세요.</p>`;
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
              <p class="featured-card-desc">${escapeHTML(menu.description || "매장에서 준비한 오늘의 메뉴입니다.")}</p>
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
  const prevButtonEl = document.getElementById("recommendationPrev");
  const nextButtonEl = document.getElementById("recommendationNext");
  const submitButtonEl = document.getElementById("recommendationSubmit");
  const resultsEl = document.getElementById("recommendationResults");
  const resetButtonEl = document.getElementById("recommendationReset");
  const restartButtonEl = document.getElementById("recommendationRestart");

  if (formEl) {
    formEl.addEventListener("click", handlePreferenceChipClick);
  }

  if (prevButtonEl) {
    prevButtonEl.addEventListener("click", handleRecommendationPrev);
  }

  if (nextButtonEl) {
    nextButtonEl.addEventListener("click", handleRecommendationNext);
  }

  if (submitButtonEl) {
    submitButtonEl.addEventListener("click", handleRecommendationSubmit);
  }

  if (resultsEl) {
    resultsEl.addEventListener("click", handleRecommendationActionClick);
  }

  if (resetButtonEl) {
    resetButtonEl.addEventListener("click", resetRecommendationSelections);
  }

  if (restartButtonEl) {
    restartButtonEl.addEventListener("click", () => {
      currentWizardStep = 1;
      updateWizardUI();
      smoothScrollTo(document.getElementById("curation"));
      setRecommendationFeedback("다시 취향을 골라보세요. 다른 조합으로도 바로 추천해드릴게요.");
    });
  }

  resetRecommendationSelections();
}

function init() {
  initializeSharedCustomerUI();

  const featuredEl = document.getElementById("featuredScroll");
  const todayMenuCardEl = document.getElementById("todayMenuCard");

  renderFeaturedMenus();
  renderTodayMenu();
  initRecommendationUI();
  updateCartBadge();
  updateHeaderState();

  if (featuredEl) {
    featuredEl.addEventListener("click", handleFeaturedClick);
  }

  if (todayMenuCardEl) {
    todayMenuCardEl.addEventListener("click", handleRecommendationActionClick);
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

init();
