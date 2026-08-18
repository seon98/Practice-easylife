````bash
cat > README.md <<'EOF'
# EasyLife Practice

## 1단계 — EasyLife 기본 서비스 목록 UI 만들기

이번 단계에서는 Next.js 기본 화면을 제거하고  
**서비스 데이터 6개를 카드 형태로 출력하는 EasyLife 기본 UI**를 구현합니다.

---

## 1. 목표

이번 단계의 완료 목표는 다음과 같습니다.

- TypeScript `interface` 작성
- 서비스 데이터 배열 생성
- 재사용 가능한 `ServiceCard` 컴포넌트 작성
- `map()`을 이용한 서비스 카드 반복 출력
- Tailwind CSS를 이용한 반응형 UI 구성
- Next.js metadata 수정
- lint / build 검증
- Git 커밋

이번 단계에서는 아직 다음 기능을 구현하지 않습니다.

- 검색
- 카테고리 필터
- 즐겨찾기
- localStorage
- FastAPI
- PostgreSQL
- JWT

---

# 2. 프로젝트 실행

프로젝트 폴더로 이동합니다.

```bash
cd ~/Projects/practice-easylife
````

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 다음 주소로 접속합니다.

```text
http://localhost:3000
```

Next.js 기본 화면이 정상적으로 나타나면 준비 완료입니다.

---

# 3. 최종 폴더 구조

이번 단계가 끝나면 프로젝트 구조는 다음과 같습니다.

```text
practice-easylife/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── ServiceCard.tsx
│
├── data/
│   └── services.ts
│
├── types/
│   └── service.ts
│
├── public/
├── package.json
├── package-lock.json
└── tsconfig.json
```

각 폴더의 역할은 다음과 같습니다.

| 폴더/파일            | 역할                        |
| ---------------- | ------------------------- |
| `types/`         | TypeScript 타입 정의          |
| `data/`          | 서비스 데이터 저장                |
| `components/`    | 재사용 가능한 UI 컴포넌트           |
| `app/page.tsx`   | 메인 화면                     |
| `app/layout.tsx` | 전체 애플리케이션 레이아웃 및 metadata |

---

# 4. 폴더 생성

프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
mkdir -p components data types
```

생성 여부를 확인합니다.

```bash
ls
```

다음 폴더가 보이면 정상입니다.

```text
app
components
data
types
public
```

---

# 5. Service 타입 정의

파일을 생성합니다.

```text
types/service.ts
```

코드:

```ts
export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  url: string;
}
```

## 설명

`Service`는 EasyLife에서 사용하는 서비스 데이터의 구조를 정의합니다.

예:

```ts
{
  id: 1,
  name: "정부24",
  description: "정부 민원 서비스를 이용할 수 있습니다.",
  category: "공공",
  url: "https://www.gov.kr"
}
```

TypeScript는 이 구조를 기준으로 잘못된 데이터 입력을 검사할 수 있습니다.

예를 들어 다음 코드는 오류가 됩니다.

```ts
{
  id: "1"
}
```

`id`는 `number`로 정의했지만 문자열을 사용했기 때문입니다.

---

# 6. 서비스 데이터 작성

파일:

```text
data/services.ts
```

전체 코드:

```ts
import type { Service } from "@/types/service";

export const services: Service[] = [
  {
    id: 1,
    name: "정부24",
    description:
      "주민등록등본, 각종 증명서 발급 등 정부 민원 서비스를 이용할 수 있습니다.",
    category: "공공",
    url: "https://www.gov.kr",
  },
  {
    id: 2,
    name: "홈택스",
    description:
      "세금 신고, 납부, 사업자 관련 업무 등을 온라인으로 처리할 수 있습니다.",
    category: "세금",
    url: "https://www.hometax.go.kr",
  },
  {
    id: 3,
    name: "복지로",
    description:
      "복지 서비스 검색과 복지 급여 신청 등에 필요한 정보를 제공합니다.",
    category: "복지",
    url: "https://www.bokjiro.go.kr",
  },
  {
    id: 4,
    name: "고용24",
    description:
      "채용 정보와 취업 지원 등 고용 관련 서비스를 확인할 수 있습니다.",
    category: "취업",
    url: "https://www.work24.go.kr",
  },
  {
    id: 5,
    name: "K-Startup",
    description:
      "예비 창업자와 창업 기업을 위한 지원사업과 창업 정보를 제공합니다.",
    category: "창업",
    url: "https://www.k-startup.go.kr",
  },
  {
    id: 6,
    name: "공공데이터포털",
    description:
      "정부와 공공기관이 제공하는 데이터와 OpenAPI를 검색할 수 있습니다.",
    category: "데이터",
    url: "https://www.data.go.kr",
  },
];
```

## 핵심

```ts
export const services: Service[] = [...]
```

`Service[]`는 다음 의미입니다.

```text
Service 객체가 여러 개 들어있는 배열
```

즉:

```text
services
├── Service
├── Service
├── Service
├── Service
├── Service
└── Service
```

구조입니다.

---

# 7. ServiceCard 컴포넌트 작성

파일:

```text
components/ServiceCard.tsx
```

전체 코드:

```tsx
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* 서비스 카테고리 */}
      <div>
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {service.category}
        </span>
      </div>

      {/* 서비스 이름 */}
      <h2 className="mt-4 text-xl font-bold text-gray-900">
        {service.name}
      </h2>

      {/* 서비스 설명 */}
      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
        {service.description}
      </p>

      {/* 외부 서비스 이동 */}
      <a
        href={service.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center text-sm font-semibold text-gray-900 hover:underline"
      >
        서비스 바로가기

        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </a>
    </article>
  );
}
```

---

# 8. Props 이해하기

다음 코드는 `ServiceCard`가 어떤 데이터를 받을지 정의합니다.

```tsx
interface ServiceCardProps {
  service: Service;
}
```

그리고 다음 코드로 전달받습니다.

```tsx
export default function ServiceCard({ service }: ServiceCardProps)
```

부모 컴포넌트에서는 다음과 같이 전달합니다.

```tsx
<ServiceCard service={service} />
```

데이터 흐름:

```text
page.tsx
   │
   │ service 전달
   ▼
ServiceCard
   │
   ├── service.name
   ├── service.category
   ├── service.description
   └── service.url
```

---

# 9. 메인 페이지 작성

파일:

```text
app/page.tsx
```

기존 내용을 모두 삭제하고 다음 코드로 교체합니다.

```tsx
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/services";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero 영역 */}
      <section className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <p className="text-sm font-semibold text-gray-500">
            EasyLife Practice
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            생활에 필요한 서비스를
            <br />
            한곳에서 찾아보세요.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
            공공서비스, 세금, 복지, 취업, 창업 등 일상생활에 필요한
            서비스를 쉽고 빠르게 확인할 수 있습니다.
          </p>

        </div>

      </section>

      {/* 서비스 목록 */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <div className="mb-8">

          <h2 className="text-2xl font-bold text-gray-950">
            전체 서비스
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            현재 {services.length}개의 서비스를 제공하고 있습니다.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}

        </div>

      </section>

    </main>
  );
}
```

---

# 10. map() 이해하기

다음 코드가 서비스 카드 출력의 핵심입니다.

```tsx
{services.map((service) => (
  <ServiceCard
    key={service.id}
    service={service}
  />
))}
```

현재 데이터:

```text
services
├── 정부24
├── 홈택스
├── 복지로
├── 고용24
├── K-Startup
└── 공공데이터포털
```

`map()`은 배열에서 데이터를 하나씩 꺼내 `ServiceCard`로 변환합니다.

```text
Service 데이터
      ↓
    map()
      ↓
ServiceCard
```

서비스 데이터가 6개이므로:

```text
ServiceCard × 6
```

이 렌더링됩니다.

---

# 11. key 이해하기

리스트를 렌더링할 때 React는 각 항목을 구분할 고유 값이 필요합니다.

```tsx
key={service.id}
```

서비스별 ID:

```text
정부24           id: 1
홈택스           id: 2
복지로           id: 3
고용24           id: 4
K-Startup        id: 5
공공데이터포털    id: 6
```

따라서 `id`를 `key`로 사용합니다.

---

# 12. layout.tsx 수정

파일:

```text
app/layout.tsx
```

다음 코드로 수정합니다.

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyLife Practice",
  description: "생활에 필요한 서비스를 한곳에서 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

주요 변경 사항:

```ts
title: "EasyLife Practice"
```

브라우저 탭 제목 등에 사용됩니다.

```tsx
<html lang="ko">
```

페이지의 기본 언어를 한국어로 지정합니다.

---

# 13. globals.css 확인

파일:

```text
app/globals.css
```

Tailwind CSS 설정이 정상적으로 되어 있는지 확인합니다.

```css
@import "tailwindcss";
```

이번 단계에서는 별도의 CSS를 많이 작성하지 않고 Tailwind utility class를 중심으로 UI를 구성합니다.

---

# 14. 전체 데이터 흐름

현재 EasyLife의 구조:

```text
types/service.ts
        │
        │ Service 구조 정의
        ▼
data/services.ts
        │
        │ Service[] 데이터
        ▼
app/page.tsx
        │
        │ map()
        ▼
ServiceCard.tsx
        │
        ▼
브라우저
```

각 파일 역할:

```text
service.ts
    ↓
데이터 구조

services.ts
    ↓
실제 데이터

page.tsx
    ↓
데이터 반복 처리

ServiceCard.tsx
    ↓
화면 출력
```

---

# 15. 반응형 UI

서비스 목록:

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
```

화면 크기에 따라 카드 개수가 변경됩니다.

## 모바일

```text
[ 카드 ]
[ 카드 ]
[ 카드 ]
[ 카드 ]
```

## 태블릿

```text
[ 카드 ][ 카드 ]
[ 카드 ][ 카드 ]
[ 카드 ][ 카드 ]
```

## PC

```text
[ 카드 ][ 카드 ][ 카드 ]
[ 카드 ][ 카드 ][ 카드 ]
```

---

# 16. 실행 확인

개발 서버 실행:

```bash
npm run dev
```

브라우저:

```text
http://localhost:3000
```

확인 항목:

* EasyLife Practice 제목 표시
* 소개 문구 표시
* 전체 서비스 영역 표시
* 서비스 카드 6개 표시
* 모바일 / PC 반응형 동작
* 서비스 바로가기 링크 동작

---

# 17. ESLint 검사

코드 오류와 품질을 검사합니다.

```bash
npm run lint
```

오류가 없다면 정상입니다.

---

# 18. Production Build 검사

실제 배포가 가능한지 확인합니다.

```bash
npm run build
```

빌드가 성공하면 production 환경에서도 컴파일 가능한 상태입니다.

---

# 19. Git 상태 확인

현재 변경 사항을 확인합니다.

```bash
git status
```

변경 파일 추가:

```bash
git add .
```

커밋:

```bash
git commit -m "feat: add initial service catalog UI"
```

---

# 20. 1단계 완료 체크리스트

* [ ] `components` 폴더 생성
* [ ] `data` 폴더 생성
* [ ] `types` 폴더 생성
* [ ] `types/service.ts` 생성
* [ ] `Service` interface 작성
* [ ] `data/services.ts` 생성
* [ ] 서비스 데이터 6개 작성
* [ ] `ServiceCard.tsx` 작성
* [ ] Props 적용
* [ ] `app/page.tsx` 수정
* [ ] `map()`으로 카드 6개 출력
* [ ] React `key` 적용
* [ ] Tailwind 반응형 Grid 적용
* [ ] `app/layout.tsx` metadata 수정
* [ ] `npm run lint` 성공
* [ ] `npm run build` 성공
* [ ] `localhost:3000` 정상 출력
* [ ] Git 커밋 완료

---

# 21. 현재 아키텍처

```text
┌──────────────────────────┐
│        Browser           │
│     localhost:3000       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       app/page.tsx       │
│          map()           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    ServiceCard.tsx       │
└────────────▲─────────────┘
             │
┌────────────┴─────────────┐
│    data/services.ts      │
│       Service[]          │
└────────────▲─────────────┘
             │
┌────────────┴─────────────┐
│   types/service.ts       │
│    interface Service     │
└──────────────────────────┘
```

현재 데이터는 서버나 데이터베이스가 아닌 `services.ts` 파일에 직접 저장되어 있습니다.

이 구조는 의도된 연습 단계입니다.

---

# 22. 다음 단계

## 2단계 — 검색 및 카테고리 필터

다음 단계에서는 사용자가 직접 서비스를 검색하고 필터링할 수 있도록 기능을 확장합니다.

예정 내용:

1. `SearchBar` 컴포넌트 생성
2. 카테고리 필터 UI 생성
3. `useState` 학습
4. `use client` 이해
5. `filter()`를 이용한 데이터 검색
6. 검색 결과 개수 표시
7. 검색 결과가 없는 경우 Empty State 처리

데이터 흐름:

```text
services.ts
    ↓
사용자 검색어 / 카테고리
    ↓
filter()
    ↓
필터링된 Service[]
    ↓
map()
    ↓
ServiceCard
```

EOF

```

프로젝트 루트인 `~/Projects/practice-easylife`에서 위 내용을 **통째로 한 번 붙여넣으면 기존 `README.md`가 1단계 문서로 교체**됩니다.
```
