# KiranaAI 🛒🤖

> **Predictive grocery run-out tracking and automated cart filling.**  
> KiranaAI learns household consumption velocity per item, predicts run-out dates with confidence bands, batches restocks using smart thresholds, and prepares your Blinkit cart through a local Playwright bridge. You review the cart and pay in Blinkit yourself.

---

## 🏗️ Architecture & Stack

KiranaAI is designed as a local-first application:
- **Backend (`/api`):** FastAPI (Python 3.11+), SQLAlchemy 2, Alembic, SQLite, Pydantic v2, scikit-learn, APScheduler, Playwright.
- **Frontend (`/web`):** React 19, TypeScript, Vite, Tailwind CSS (mobile-first, dark mode).
- **Automation (`/scripts` & `/api/app/connectors`):** Headed Playwright bridge using a persistent Chromium browser profile in `.data/browser-profile` (git-ignored).
- **Local Data (`.data/`):** SQLite database, persistent browser profile, debug screenshots.

---

## 📁 Repository Layout

```text
KiranaAI/
├── .github/workflows/ci.yml       # GitHub Actions CI workflow (lint & test)
├── .data/                         # Git-ignored local state (SQLite db, browser profile, screenshots)
├── api/                           # Backend service
│   ├── alembic/                   # Database schema migrations
│   ├── app/
│   │   ├── connectors/            # Retailer connectors (Mock, SearchLink, Blinkit)
│   │   ├── jobs/                  # Background scheduled tasks
│   │   ├── llm/                   # Optional LLM fallbacks (receipt OCR, item matching)
│   │   ├── ml/                    # Prediction ladder (EMA, Quantile regression)
│   │   ├── models/                # SQLAlchemy 2 models (users, settings, items, etc.)
│   │   ├── routers/               # FastAPI endpoints (/health, /settings, /items, ...)
│   │   ├── schemas/               # Pydantic v2 data transfer schemas
│   │   ├── services/              # Business logic & batching manager
│   │   ├── config.py              # Application settings
│   │   ├── database.py            # SQLite engine & session setup
│   │   └── main.py                # FastAPI entrypoint
│   ├── tests/                     # Pytest suite
│   └── pyproject.toml             # Python dependencies, Ruff, Black, Mypy, Pytest config
├── docs/
│   ├── SPEC.md                    # Core product & architecture specification
│   ├── BLINKIT_NOTES.md           # Spike findings & selector analysis
│   ├── DECISIONS.md               # Architectural decision record (ADR)
│   └── BACKLOG.md                 # Product roadmap & future phases
├── scripts/
│   └── blinkit_spike.py           # Playwright prototype (stops at cart)
├── web/                           # Vite + React + Tailwind frontend
│   ├── src/                       # Components, types, dashboard shell
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example                   # Environment configuration template
├── AGENTS.md                      # Agent rules & development agreement
└── README.md
```

---

## ⚡ Quickstart & Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 20+** and **npm**
- **uv** (recommended for Python package management) or standard `venv`/`pip`

---

### 1. Backend Setup (`/api`)

#### Windows (PowerShell)
```powershell
# Navigate to backend directory
cd api

# Create virtual environment and install dependencies
uv venv --python 3.11
.\.venv\Scripts\activate
uv pip install -e ".[dev]"

# Install Playwright browser binaries
.\.venv\Scripts\playwright install chromium

# Run initial database migration (seeds default local user and settings)
.\.venv\Scripts\alembic upgrade head

# Start FastAPI development server
.\.venv\Scripts\uvicorn app.main:app --reload --port 8000
```

#### macOS / Linux (Bash / Zsh)
```bash
# Navigate to backend directory
cd api

# Create virtual environment and install dependencies
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e ".[dev]"

# Install Playwright browser binaries
playwright install chromium

# Run initial database migration (seeds default local user and settings)
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

Once running:
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2. Frontend Setup (`/web`)

#### Windows (PowerShell)
```powershell
cd web
npm install
npm run dev
```

#### macOS / Linux (Bash / Zsh)
```bash
cd web
npm install
npm run dev
```

The web dashboard is accessible at: [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing & Code Quality

### Backend Quality Suite (Ruff, Black, Mypy, Pytest)

#### Windows (PowerShell)
```powershell
cd api
.\.venv\Scripts\ruff check .
.\.venv\Scripts\black --check .
.\.venv\Scripts\mypy app
.\.venv\Scripts\pytest
```

#### macOS / Linux (Bash / Zsh)
```bash
cd api
ruff check .
black --check .
mypy app
pytest
```

### Frontend Quality Suite (ESLint, Prettier, TypeScript)

```bash
cd web
npm run lint
npm run format:check
npm run build
```

---

## 🛒 Blinkit Automation Spike

A throwaway spike (`scripts/blinkit_spike.py`) verifies headed Playwright automation with session persistence.

#### Windows (PowerShell)
```powershell
cd api
.\.venv\Scripts\python ..\scripts\blinkit_spike.py
```

#### macOS / Linux (Bash / Zsh)
```bash
cd api
python ../scripts/blinkit_spike.py
```

What the spike does:
1. Launches headed Chromium with persistent profile in `.data/browser-profile`.
2. Navigates to a mapped Blinkit product URL.
3. Clicks `ADD` and reads the updated cart count and price.
4. **STOPS AT CART:** Explicitly halts at cart review. **No checkout or payment automation exists.**
5. Saves a verification screenshot to `.data/screenshots/cart_final_state.png`.
6. See [`docs/BLINKIT_NOTES.md`](docs/BLINKIT_NOTES.md) for detailed observations.

---

## 🛡️ Hard Safety Invariants

1. **Human in Control:** The app never clicks checkout, place order, or pay. The automation bridge strictly stops at a filled cart.
2. **Zero Credential Storage:** The user logs into Blinkit manually in the headed browser. No passwords or OTPs are stored.
3. **No Scraping / Evasion:** KiranaAI only visits mapped product URLs. No CAPTCHA solving or bot evasion plugins are permitted.
4. **Scoped Data Model:** Every table includes `user_id`, and queries are strictly scoped by user.
