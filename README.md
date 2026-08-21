# EasyLife Practice

생활에 필요한 공공·세금·복지 서비스를 검색하고 즐겨찾기할 수 있는 Next.js/FastAPI 학습 프로젝트입니다. 익명 즐겨찾기, JWT 계정, 관리자 서비스 관리 기능을 포함합니다.

## 기술 스택과 구조

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2 Async, Alembic, Python 3.12
- Database: PostgreSQL 17 (개발 Docker, 운영 Managed PostgreSQL)
- Quality: ESLint, Vitest, pytest, Ruff, mypy, GitHub Actions

`Browser → Next.js → FastAPI → PostgreSQL` 구조이며 운영에서는 모든 구간을 HTTPS로 연결합니다.

## 로컬 실행

```bash
cp .env.example .env.local
cp apps/api/.env.example apps/api/.env
docker compose -f compose.db.yml up -d
cd apps/api && uv sync --all-groups --python 3.12
uv run alembic upgrade head
uv run python -m scripts.seed_services
uv run uvicorn app.main:app --reload
# 별도 터미널, 저장소 루트
npm ci && npm run dev
```

주요 환경변수는 `API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `APP_ENV`입니다. 실제 비밀값은 저장소에 저장하지 않습니다. 최초 관리자는 DB 관리 도구에서 해당 사용자의 `is_admin`을 명시적으로 변경합니다.

## 검사와 마이그레이션

```bash
npm run lint && npm test && npm run build
cd apps/api
uv run ruff check . && uv run mypy app && uv run pytest -q
uv run alembic current && uv run alembic heads && uv run alembic check
```

테스트는 `easylife_test` 전용 DB를 생성·초기화하며 개발 DB 테이블을 변경하지 않습니다.

## Docker

```bash
docker compose build
docker compose up -d
docker compose run --rm api alembic upgrade head
docker compose ps
docker compose down
```

마이그레이션은 애플리케이션 시작 시 자동 실행하지 않습니다. PostgreSQL volume은 `down`으로 삭제되지 않습니다.

## Production

- Frontend: Vercel에 저장소 루트를 배포하고 두 API URL을 HTTPS 백엔드 주소로 설정
- Backend: `render.yaml` 또는 API Dockerfile 사용, 배포 전 release command로 `alembic upgrade head`
- Database: Neon/Supabase 등 PostgreSQL URL을 `postgresql+asyncpg://` 형식으로 `DATABASE_URL`에만 저장하고 공급자 요구 SSL 설정 사용
- Domain: `www`는 Vercel, `api`는 백엔드 플랫폼 DNS로 연결하고 자동 TLS 사용. HTTPS frontend origin만 `CORS_ORIGINS`에 허용
- Monitoring: 플랫폼 로그와 `/health`, `/health/ready`, `X-Request-ID`/응답시간 로그를 사용. 필요 시 DSN 기반 오류 추적 도구를 추가

배포 후 `FRONTEND_URL=https://... API_URL=https://... ./scripts/smoke-production.sh`로 공개 경로를 점검합니다. JWT, 비밀번호, DB URL은 로그에 남기지 않습니다.
