# 카페 앱 - 프로젝트 청사진

## 폴더 구조 (현재 기준)

```text
cafe-app-copy/
├── index.html                         # 메인 (고객)
├── index.css                          # 메인 페이지 스타일
├── index.js                           # 메인 페이지 로직
├── menus/
│   ├── list.html                      # 메뉴 목록
│   ├── list.css
│   ├── list.js
│   ├── detail.html                    # 메뉴 상세
│   ├── detail.css
│   └── detail.js
├── my/
│   ├── index.html                     # 마이페이지 메인
│   ├── index.css
│   └── index.js
├── basket/
│   ├── list.html                      # 장바구니
│   ├── list.css
│   └── list.js
├── orders/
│   ├── list.html                      # 주문 내역 목록
│   ├── list.css
│   ├── list.js
│   ├── detail.html                    # 주문 상세
│   ├── detail.css
│   └── detail.js
├── admin/
│   ├── index.html                     # 대시보드
│   ├── index.css
│   ├── index.js
│   ├── menus/
│   │   ├── list.html                  # 메뉴 목록
│   │   ├── list.css
│   │   ├── list.js
│   │   ├── detail.html                # 메뉴 상세
│   │   ├── detail.css
│   │   ├── detail.js
│   │   ├── create.html                # 메뉴 추가
│   │   ├── create.css
│   │   ├── create.js
│   │   ├── edit.html                  # 메뉴 수정
│   │   ├── edit.css
│   │   └── edit.js
│   └── orders/
│       ├── list.html                  # 주문 목록
│       ├── list.css
│       ├── list.js
│       ├── detail.html                # 주문 상세
│       ├── detail.css
│       ├── detail.js
│       ├── edit.html                  # 주문 상태 수정
│       ├── edit.css
│       └── edit.js
├── css/
│   └── variables.css                  # 전역 CSS 변수
├── js/
│   ├── data.js                        # 메뉴/카테고리/주문 데이터
│   └── utils.js                       # 공통 유틸리티
└── legacy-step2-backup/               # 이전 작업 백업본(미사용)
```

## 역할별 경로

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| 고객 | `/`, `/menus/`, `/my/`, `/basket/`, `/orders/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역 |
| 관리자/사장 | `/admin/`, `/admin/menus/`, `/admin/orders/` | 대시보드, 메뉴 CRUD, 주문 관리 |

## UI 방향

- 테마: 화이트 + 브라운 계열의 카페 무드
- 분위기: 미니멀 + 모던
- 카드 스타일: Glass morphism
- 레이아웃: 반응형 중심 (모바일 우선)

## 파일 배치 원칙

- HTML과 같은 디렉터리에 해당 페이지의 `css`, `js` 파일을 함께 둔다
- 파일명은 HTML 기준으로 맞춘다
- 전역 공통 자원만 `css/`, `js/` 폴더로 분리한다
- 역할별 진입 경로는 `admin/`, `menus/`, `my/`, `basket/`, `orders/`로 구분한다
- 현재는 프로젝트 루트가 바로 웹 루트이며 별도의 하위 웹 루트 폴더는 사용하지 않는다

---

## 구현 TODO

### 1단계: 공유 자원

- [x] `css/variables.css` - 전역 CSS 변수, 리셋
- [x] `js/data.js` - 메뉴/카테고리 데이터
- [x] `js/utils.js` - 공통 유틸리티

### 2단계: 관리자 - 메뉴 관리

- [x] `admin/menus/list.html` - 메뉴 목록
- [x] `admin/menus/list.css`
- [x] `admin/menus/list.js`
- [x] `admin/menus/detail.html` - 메뉴 상세
- [x] `admin/menus/detail.css`
- [x] `admin/menus/detail.js`
- [x] `admin/menus/create.html` - 메뉴 추가
- [x] `admin/menus/create.css`
- [x] `admin/menus/create.js`
- [x] `admin/menus/edit.html` - 메뉴 수정
- [x] `admin/menus/edit.css`
- [x] `admin/menus/edit.js`

### 3단계: 고객 - 메뉴 조회

- [x] `menus/list.html` - 메뉴 목록
- [x] `menus/list.css`
- [x] `menus/list.js`
- [x] `menus/detail.html` - 메뉴 상세
- [x] `menus/detail.css`
- [x] `menus/detail.js`

### 4단계: 고객 - 장바구니

- [x] `basket/list.html` - 장바구니
- [x] `basket/list.css`
- [x] `basket/list.js`

### 5단계: 고객 - 주문 관리

- [x] `orders/list.html` - 주문 내역 목록
- [x] `orders/list.css`
- [x] `orders/list.js`
- [x] `orders/detail.html` - 주문 상세
- [x] `orders/detail.css`
- [x] `orders/detail.js`

### 6단계: 고객 - 메인 페이지

- [x] `index.html`
- [x] `index.css`
- [x] `index.js`

### 7단계: 고객 - 마이페이지

- [x] `my/index.html`
- [x] `my/index.css`
- [x] `my/index.js`

### 8단계: 관리자 - 대시보드 및 주문 관리

- [x] `admin/index.html` - 대시보드
- [x] `admin/index.css`
- [x] `admin/index.js`
- [x] `admin/orders/list.html` - 주문 목록
- [x] `admin/orders/list.css`
- [x] `admin/orders/list.js`
- [x] `admin/orders/detail.html` - 주문 상세
- [x] `admin/orders/detail.css`
- [x] `admin/orders/detail.js`
- [x] `admin/orders/edit.html` - 주문 상태 수정
- [x] `admin/orders/edit.css`
- [x] `admin/orders/edit.js`

> 2026-07-11 반영 메모
>
> 예전 분리형 구조 기준으로 적혀 있던 경로 표기를 모두 현재 `cafe-app-copy` 루트 구조 기준으로 정리했다.
> 실제 실행 경로는 프로젝트 루트 아래의 `index.html`, `admin/`, `menus/`, `my/`, `basket/`, `orders/`, `css/`, `js/`를 사용한다.
