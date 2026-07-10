# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```
project1/
│
├── backend/                           # 향후 서버/API 구현 예정 (현재 없음)
│   └── README.md
│
├── frontend/                          # 정적 프런트엔드(HTML/CSS/JS + localStorage)
│   │
│   ├── index.html                     # 메인 (고객)
│   ├── index.css                      # 메인 페이지 스타일
│   ├── index.js                       # 메인 페이지 로직
│   │
│   ├── 👤 고객 - 메뉴
│   │   └── menus/
│   │       ├── list.html              # 메뉴 목록
│   │       ├── list.css
│   │       ├── list.js
│   │       ├── detail.html            # 메뉴 상세
│   │       ├── detail.css
│   │       └── detail.js
│   │
│   ├── 👤 고객 - 마이페이지
│   │   └── my/
│   │       ├── index.html             # 마이페이지 메인
│   │       ├── index.css
│   │       └── index.js
│   │
│   ├── 👤 고객 - 장바구니
│   │   └── basket/
│   │       ├── list.html              # 장바구니
│   │       ├── list.css
│   │       └── list.js
│   │
│   ├── 👤 고객 - 주문 내역
│   │   └── orders/
│   │       ├── list.html              # 주문 내역 목록
│   │       ├── list.css
│   │       ├── list.js
│   │       ├── detail.html            # 주문 상세
│   │       ├── detail.css
│   │       └── detail.js
│   │
│   ├── 🔴 관리자/사장
│   │   └── admin/
│   │       ├── index.html             # 대시보드
│   │       ├── index.css
│   │       ├── index.js
│   │       │
│   │       ├── menus/
│   │       │   ├── list.html          # 메뉴 목록
│   │       │   ├── list.css
│   │       │   ├── list.js
│   │       │   ├── detail.html        # 메뉴 상세
│   │       │   ├── detail.css
│   │       │   ├── detail.js
│   │       │   ├── create.html        # 메뉴 추가
│   │       │   ├── create.css
│   │       │   ├── create.js
│   │       │   ├── edit.html          # 메뉴 수정
│   │       │   ├── edit.css
│   │       │   └── edit.js
│   │       │
│   │       └── orders/
│   │           ├── list.html          # 주문 목록
│   │           ├── list.css
│   │           ├── list.js
│   │           ├── detail.html        # 주문 상세
│   │           ├── detail.css
│   │           ├── detail.js
│   │           ├── edit.html          # 주문 상태 수정
│   │           ├── edit.css
│   │           └── edit.js
│   │
│   └── 📦 공유 자원
│       ├── css/
│       │   └── variables.css          # CSS 변수 (전역)
│       └── js/
│           ├── data.js                # 메뉴/카테고리/주문 데이터
│           └── utils.js                # 공통 유틸리티
│
└── legacy-step2-backup/               # 2단계 작업 중 남은 예전 백업(중복, 미사용)
    ├── admin/menus/*
    └── js/data.js
```

## 👥 역할별 기능

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| **고객** | `/frontend/`, `/frontend/menus/`, `/frontend/my/`, `/frontend/basket/`, `/frontend/orders/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역 |
| **관리자/사장** | `/frontend/admin/`, `/frontend/admin/menus/`, `/frontend/admin/orders/` | 대시보드, 메뉴 CRUD, 주문 관리 |

## 🎨 디자인

- **테마**: 라이트 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Glass morphism
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `frontend/css/`, `frontend/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리
- **backend/frontend 분리**: 서버 코드가 생기면 `backend/`에, 정적 자원은 전부 `frontend/`에 둔다

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `frontend/css/variables.css` — 전역 CSS 변수, 리셋
- [x] `frontend/js/data.js` — 메뉴/카테고리 데이터
- [x] `frontend/js/utils.js` — 공통 유틸리티 (카트, 포맷 등)

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `frontend/admin/menus/list.html` — 메뉴 목록
- [x] `frontend/admin/menus/list.css`
- [x] `frontend/admin/menus/list.js`
- [x] `frontend/admin/menus/detail.html` — 메뉴 상세
- [x] `frontend/admin/menus/detail.css`
- [x] `frontend/admin/menus/detail.js`
- [x] `frontend/admin/menus/create.html` — 메뉴 추가
- [x] `frontend/admin/menus/create.css`
- [x] `frontend/admin/menus/create.js`
- [x] `frontend/admin/menus/edit.html` — 메뉴 수정
- [x] `frontend/admin/menus/edit.css`
- [x] `frontend/admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `frontend/menus/list.html` — 메뉴 목록
- [x] `frontend/menus/list.css`
- [x] `frontend/menus/list.js`
- [x] `frontend/menus/detail.html` — 메뉴 상세
- [x] `frontend/menus/detail.css`
- [x] `frontend/menus/detail.js`

### 4단계: 고객 - 장바구니 관리 시스템

- [x] `frontend/basket/list.html` — 장바구니
- [x] `frontend/basket/list.css`
- [x] `frontend/basket/list.js`

### 5단계: 고객 - 주문 관리 시스템

- [x] `frontend/orders/list.html` — 주문 내역 목록
- [x] `frontend/orders/list.css`
- [x] `frontend/orders/list.js`
- [x] `frontend/orders/detail.html` — 주문 상세
- [x] `frontend/orders/detail.css`
- [x] `frontend/orders/detail.js`

### 6단계: 고객 - 메인 페이지

- [x] `frontend/index.html`
- [x] `frontend/index.css`
- [x] `frontend/index.js`

### 7단계: 고객 - 마이페이지

- [x] `frontend/my/index.html`
- [x] `frontend/my/index.css`
- [x] `frontend/my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [x] `frontend/admin/index.html` — 대시보드
- [x] `frontend/admin/index.css`
- [x] `frontend/admin/index.js`
- [x] `frontend/admin/orders/list.html` — 주문 목록
- [x] `frontend/admin/orders/list.css`
- [x] `frontend/admin/orders/list.js`
- [x] `frontend/admin/orders/detail.html` — 주문 상세
- [x] `frontend/admin/orders/detail.css`
- [x] `frontend/admin/orders/detail.js`
- [x] `frontend/admin/orders/edit.html` — 주문 상태 수정
- [x] `frontend/admin/orders/edit.css`
- [x] `frontend/admin/orders/edit.js`
> 2026-07-11 구조 변경 메모
>
> 현재 실제 실행 구조는 `frontend/`, `backend/` 분리형이 아니라 리포지토리 루트가 바로 웹 루트입니다.
> `index.html`, `admin/`, `menus/`, `my/`, `basket/`, `orders/`, `css/`, `js/`가 모두 프로젝트 루트 바로 아래에 있습니다.
> 아래 상세 체크리스트에 남아 있는 `frontend/` 표기는 이전 구조 기준 기록입니다.
