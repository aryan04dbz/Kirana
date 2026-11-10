# KiranaAI Implementation Progress

**Current Phase:** Phase 0 — Foundation, Scaffolding & Spike Verification  
**Status:** Completing Phase 0 (Review & Gap Alignment)  
**Last Updated:** 2026-11-10  

---

## 1. Phase Overview & Roadmap Status

| Phase | Description | Status | Target Deliverables |
| :--- | :--- | :---: | :--- |
| **Phase 0** | **Monorepo Scaffolding, Core Layout & Automation Spike** | **Finishing** | Monorepo layout, FastAPI + SQLite + Alembic, React + Tailwind shell, Playwright spike, CI pipeline |
| **Phase 1** | Core Tracking & Pantry Calibration | Planned | Items CRUD, preferred products, 1-tap logging (`Finished`, `Opened`, `Restocked`), swipe audit onboarding |
| **Phase 2** | History Import & Inferred Cycles | Planned | CSV/JSON past-order importer, match rules, purchase de-duplication, inferred cycle duration derivation |
| **Phase 3** | Hybrid ML Prediction Engine | Planned | Cold-start baseline, recency-weighted EMA, global scikit-learn regression, P10/P90 confidence bands |
| **Phase 4** | Restock Order Threshold Batching | Planned | Lookahead window & min order value batching, draft order review screen, quantity steppers |
| **Phase 5** | Blinkit Playwright Connector | Planned | `BlinkitPlaywrightConnector` under `KIRANA_ENABLE_BLINKIT`, real-time SSE progress, out-of-stock search links |
| **Phase 6** | Autonomy Stages & Insights | Planned | Learning $\to$ Assisted $\to$ Auto promotions/demotions, accuracy tracking (error in days), effort metrics |
| **Phase 7** | Telegram Bot Daemon & Demo Mode | Planned | Text & voice note restock logger, deterministic demo mode with synthetic data |
| **Phase 8** | Multi-Platform & Official Integrations | Backlog | Official Instamart MCP connector, Zepto adapter, multi-user household support |

---

## 2. Phase 0 Task & Acceptance Check Matrix

| Task / Requirement | Spec Reference | Status | Verification Evidence |
| :--- | :--- | :---: | :--- |
| **Repo Layout** (`/web`, `/api`, `/docs`, `/scripts`, `.data`) | `AGENTS.md` Rule 8 | ✅ Done | Directory tree verified; all subpackages (`connectors`, `jobs`, `llm`, `ml`, `models`, `routers`, `schemas`, `services`) initialized |
| **Local Data Directory Git-Ignored** | `AGENTS.md` Rule 8, A13 | ✅ Done | `.data/`, `*.db`, `*.sqlite3` present in `.gitignore`; SQLite DB and browser profile remain strictly local |
| **FastAPI Backend Initialization** | `SPEC.md` A4, A12 | ✅ Done | FastAPI app initialized with CORS, lifecycle handler, Spec A12 standardized error formatting (`{ error: { code, message, details } }`) |
| **SQLAlchemy 2 & SQLite Setup** | `SPEC.md` A4, A7 | ✅ Done | Engine configured with `PRAGMA foreign_keys = ON`, `check_same_thread = False`, transactional `get_db` session scope |
| **Alembic Initial Migration** | `SPEC.md` A7 | ✅ Done | Migration `0001_initial_users_and_settings.py` creates `users` & `settings` tables, seeds `default_user` with baseline settings |
| **Health & Settings Endpoints** | `SPEC.md` A12 | ✅ Done | `GET /health`, `GET /api/v1/health`, `GET /api/v1/settings`, `PATCH /api/v1/settings` functioning and scoped by `user_id` |
| **Backend Testing Suite** | `AGENTS.md` Agreement | ✅ Done | 7 unit and integration tests passing (`test_db.py`, `test_health.py`, `test_settings.py`) in 0.22s |
| **Backend Code Quality & Linters** | `AGENTS.md` Stack | ✅ Done | Ruff (clean), Black (clean, 27 files), Mypy (clean, 20 source files) pass with zero errors |
| **Frontend Setup (Vite + React 19 + TS + Tailwind)** | `SPEC.md` A4, `AGENTS.md` | ✅ Done | React 19 + Vite + TypeScript + Tailwind CSS dashboard shell running |
| **Mobile-First Dark Mode UI Shell** | `SPEC.md` A6, `AGENTS.md` | ✅ Done | Dark mode toggle with `localStorage` & OS preference detection; responsive mobile layout |
| **Pantry Lifespan Visuals & 1-Tap Buttons** | `SPEC.md` A6 | ✅ Done | Status cards with color-coded badges (Green, Amber, Crimson) and interactive 1-tap buttons with toast alerts |
| **Frontend Quality & Build Verification** | `AGENTS.md` Agreement | ✅ Done | ESLint (clean), Prettier (clean), production bundle `tsc -b && vite build` builds in 10s |
| **GitHub Actions CI Pipeline** | `AGENTS.md` Stack | ✅ Done | `.github/workflows/ci.yml` validates backend (Python 3.11, Ruff, Black, Mypy, Alembic, Pytest) and frontend (Node 22, Prettier, ESLint, Build) |
| **Blinkit Playwright Spike** | `SPEC.md` A10, `AGENTS.md` Rule 3 | ✅ Done | `scripts/blinkit_spike.py` launches headed persistent browser, navigates to product, tests ADD button, halts strictly at cart |
| **Hard Safety Compliance** | `AGENTS.md` Rules 2, 4, 5 | ✅ Done | Spike never touches checkout/payment; zero credentials stored; stops at cart review; screenshot on error enabled |
| **Spike Findings Documentation** | `SPEC.md` A10 | ✅ Done | `docs/BLINKIT_NOTES.md` documents DOM selectors, Next.js hydration observations, location modal handling, and anti-bot pacing |

---

## 3. What is Currently Missing or Incomplete in Phase 0

1. **Port Inconsistency in Documentation (`README.md`):**
   - In commit `3c12ccb`, the backend port was updated to `9000` in `.env.example`, `api/app/config.py`, and `web/src/App.tsx`.
   - `README.md` still documents port `8000` in running commands and links (`--port 8000`, `http://127.0.0.1:8000/health`, `http://127.0.0.1:8000/docs`).
2. **Hardcoded API URL in Frontend (`web/src/App.tsx`):**
   - `App.tsx` fetches directly from `http://127.0.0.1:9000` without checking Vite environment variables (`import.meta.env.VITE_API_BASE_URL`).
3. **Architectural Decision Records (`docs/DECISIONS.md`):**
   - ADR `0001` exists, but lacks records for:
     - Port 9000 change.
     - Database model phasing (why Phase 0 only creates `users` and `settings`, deferring remaining tables to Phases 1-5).
     - Prototype spike script approach vs deferred connector class.

---

## 4. Phase 0 Exit Criteria Checklist

- [x] Repository layout matches `AGENTS.md`.
- [x] Backend tests pass (7/7).
- [x] Backend linters pass (Ruff, Black, Mypy).
- [x] Frontend checks pass (ESLint, Prettier, Vite build).
- [x] CI workflow in place for both backend and frontend.
- [x] Blinkit spike completed, safe, and documented in `docs/BLINKIT_NOTES.md`.
- [x] Local runtime data (`.data/`) verified as git-ignored.
- [ ] Address port & config documentation inconsistency.
- [ ] Record ADRs in `docs/DECISIONS.md`.
- [ ] Final user review before initiating Phase 1.
