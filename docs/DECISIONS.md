# Architecture & Technical Decisions

This document records key architectural decisions, conventions, and deviations across all development phases.

---

## 0001 - Monorepo Structure & Scaffolding (Phase 0)
- **Date:** 2026-11-08
- **Context:** Project initiation and foundation setup per `docs/SPEC.md`.
- **Decision:**
  - Standardized layout with `/api` for FastAPI backend, `/web` for React/TypeScript/Tailwind frontend, `/docs` for specifications and logs, `/scripts` for CLI/spikes, and `.data` for git-ignored local runtime state.
  - Backend uses Python 3.11+ with SQLAlchemy 2 (async-capable, synced engine for SQLite simplicity), Alembic for migrations, Pydantic v2 schemas, Ruff, Black, and Mypy.
  - Single default local user (`id: "default_user"`) seeded on initial migration with baseline threshold batching settings (`lookahead_hours=48`, `min_order_value=199`, `review_buffer_days=2`, `max_extend_days=7`).
  - Frontend initialized with Vite, React 19, TypeScript, and Tailwind CSS with mobile-first dark-mode dashboard shell.
- **Status:** Approved

---

## 0002 - Phased Database Model & Migration Rollout
- **Date:** 2026-11-08
- **Context:** `docs/SPEC.md` section A7 specifies a comprehensive 11-table schema (`users`, `settings`, `items`, `preferred_products`, `purchases`, `cycles`, `predictions`, `check_prompts`, `restock_orders`, `restock_order_items`, `connector_runs`, `import_jobs`, `match_rules`).
- **Deviation from Spec:**
  - Rather than creating all 11 tables in a single monolithic migration during Phase 0, tables are created incrementally in the phase where their business logic and tests are implemented:
    - **Phase 0:** `users`, `settings` (Base configuration & local identity).
    - **Phase 1:** `items`, `preferred_products` (Pantry tracking & calibration).
    - **Phase 2:** `purchases`, `cycles`, `match_rules`, `import_jobs` (History import & inferred cycles).
    - **Phase 3:** `predictions`, `check_prompts` (ML forecasting engine & checks).
    - **Phase 4:** `restock_orders`, `restock_order_items` (Threshold batching & cart review).
    - **Phase 5:** `connector_runs` (Playwright automation logging).
- **Rationale:** Prevents dead schema, unverified foreign key constraints, and untested database migrations. Keeps Alembic migrations strictly aligned with implemented features and test coverage.
- **Status:** Approved

---

## 0003 - Dedicated Automation Spike Script vs Connector Class in Phase 0
- **Date:** 2026-11-08
- **Context:** `docs/SPEC.md` section A10 and Hard Rule 3 define a unified connector interface (`search`, `fill_cart`, `get_cart`, `capabilities`) and `BlinkitPlaywrightConnector` gated by `KIRANA_ENABLE_BLINKIT`.
- **Deviation from Spec:**
  - In Phase 0, Playwright automation was explored via a standalone exploratory spike (`scripts/blinkit_spike.py`) rather than the production `BlinkitPlaywrightConnector` class.
- **Rationale:**
  - Validated live DOM behavior, Next.js hydration timing, location prompts, and selector stability against Blinkit before committing to an abstraction layer.
  - Ensured the critical safety invariant—**strictly stopping at the cart review screen with zero checkout/payment automation**—was proven in practice and documented in `docs/BLINKIT_NOTES.md`.
  - The formal `BlinkitPlaywrightConnector` and its companion `MockConnector` will be implemented cleanly in Phase 5 behind the connector interface.
- **Status:** Approved

---

## 0004 - Backend Server Port Moved to 9000
- **Date:** 2026-11-10
- **Context:** Initial documentation and configs referenced default FastAPI port `8000`.
- **Deviation from Spec:**
  - Default API port was updated from `8000` to `9000` across `api/app/config.py`, `.env.example`, and frontend fetch calls.
- **Rationale:** Port `8000` frequently conflicts with common local developer tooling, proxies, and background services on Windows. Port `9000` is dedicated to KiranaAI backend development.
- **Status:** Approved

---

## 0005 - Frontend Standalone Preview State in Phase 0
- **Date:** 2026-11-08
- **Context:** Phase 0 requires a mobile-first dark-mode shell before backend pantry endpoints exist.
- **Deviation from Spec:**
  - `web/src/App.tsx` contains a static preview array (`INITIAL_ITEMS`) and a resilient `try/catch` around backend calls, allowing the frontend to be developed, styled, and tested in isolation even when the backend is offline.
  - Phase 1 will replace `INITIAL_ITEMS` with live React state backed by `GET /api/v1/items`.
- **Status:** Approved
