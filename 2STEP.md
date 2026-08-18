
````md
# 2단계 — 검색 및 카테고리 필터

## 목표

서비스 목록에 검색과 카테고리 필터 기능을 추가합니다.

## 추가 파일

```text
components/
├── SearchBar.tsx
├── CategoryFilter.tsx
└── ServiceExplorer.tsx
````

## 핵심 개념

* `"use client"`
* `useState`
* `onChange`
* `onClick`
* `filter()`
* `includes()`
* 조건부 렌더링

## 데이터 흐름

```text
사용자 입력
↓
useState
↓
filter()
↓
filteredServices
↓
map()
↓
ServiceCard
```

## 실행

```bash
npm run dev
```

접속:

```text
http://localhost:3000
```

## 테스트

* 검색어 입력 시 서비스 필터링
* 카테고리 선택 시 해당 서비스만 표시
* 검색 결과 개수 표시
* 결과가 없으면 안내 화면 표시
* 필터 초기화 동작 확인

## 코드 검사

```bash
npm run lint
npm run build
```

## Git 커밋

```bash
git add .
git commit -m "feat: add service search and category filters"
```

## 2단계 핵심

**사용자 입력 → State 변경 → filter() → map() → 화면 변경**

## 다음 단계

3단계에서는 즐겨찾기와 `localStorage`를 구현합니다.
