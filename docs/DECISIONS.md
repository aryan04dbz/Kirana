# Architecture & Technical Decisions

This document records key architectural decisions, conventions, and deviations across all development phases.

## 0001 - Monorepo Structure & Scaffolding (Phase 0)
- **Date:** 2026-11-08
- **Context:** Project initiation and foundation setup per `docs/SPEC.md`.
- **Decision:**
  - Standardized layout with `/api` for FastAPI backend, `/web` for React/TypeScript/Tailwind frontend, `/docs` for specifications and logs, `/scripts` for CLI/spikes, and `.data` for git-ignored local runtime state.
  - Backend uses Python 3.11+ with SQLAlchemy 2 (async-capable, synced engine for SQLite simplicity), Alembic for migrations, Pydantic v2 schemas, Ruff, Black, and Mypy.
  - Single default local user (`id: "default_user"`) seeded on initial migration with baseline threshold batching settings (`lookahead_hours=48`, `min_order_value=199`, `review_buffer_days=2`, `max_extend_days=7`).
  - Frontend initialized with Vite, React 19, TypeScript, and Tailwind CSS with mobile-first dark-mode dashboard shell.
- **Status:** Approved
