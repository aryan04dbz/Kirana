# Part A: Product Spec

## A1. Vision

KiranaAI tracks household grocery usage, predicts when each item will run out with adaptive ML, batches the items that are due, and fills your Blinkit cart for you. You review the list, click one button, and pay in Blinkit yourself.

- **Goal 1:** a portfolio project strong enough to help land internships and jobs.
- **Goal 2:** an architecture that can grow into a startup (user\_id everywhere, connector based, measurable accuracy).
- **Principle 1, low friction:** logging must take one tap, one swipe or one message.
- **Principle 2, effort fades:** the app asks for less as its predictions for an item prove accurate, until you only approve carts.
- **Principle 3, human in control:** the app never checks out or pays. It stops at a filled cart.
- **Principle 4, explainable:** every prediction stores its method, range and later its real error.

## A2. Decisions locked

| Topic | Decision | Origin |
| --- | --- | --- |
| Product name | KiranaAI (rename freely) | KiranaAI |
| Purpose and deadline | Portfolio first, startup later, no fixed deadline | Interview |
| First retailer | Blinkit through a local Playwright bridge, behind a connector interface | Merged |
| Product mapping | Paste the exact Blinkit product link once per item | KiranaAI |
| Item model | Generic item (Milk) plus a linked preferred product (exact link, brand, size) | GroceryPilot |
| Data input | Past-order import, receipt OCR, manual entry, one-tap actions, swipe audit, Telegram | Merged |
| Existing data | Order history with dates but no finish dates, so infer from repurchase gaps | Interview |
| Stock model | Packs are tracked as UNOPENED, IN\_USE or DEPLETED (so stockpiling does not distort usage) | KiranaAI |
| Stack | React (Vite) with TypeScript and Tailwind, FastAPI, SQLite through SQLAlchemy and Alembic (Postgres-ready) | Merged |
| Users | One local user in v1, with user\_id on every table | GroceryPilot |
| Cart trigger | Threshold batching plus one-click trigger | Chosen by Aryan |
| Feedback | One-tap and swipe checks that fade to fully automatic | Interview |
| Notifications | In-app first, Telegram in a later phase | Merged |
| Scheduler | APScheduler inside FastAPI | GroceryPilot |

## A3. Scope

**MVP (Phases 0 to 5):** tracking, onboarding with swipe audit, import and receipt scan, prediction with confidence range, threshold batching, cart review, Blinkit cart filling, global ML model, autonomy stages, weekly check, insights.

**Version 1.1 (Phases 6 and 7):** Telegram bot (text and voice), polish, demo mode, deployment of the demo.

**Later (Phase 8):** official Instamart connector through the Swiggy MCP, Zepto, multi-user households, hosted version.

**Out of scope, always:** checkout or payment automation, bypassing CAPTCHAs or bot checks, storing retailer passwords, scraping product catalogs, running automation for other people’s accounts.

## A4. Architecture

KiranaAI is a local-first monolith.

- **React dashboard (Vite):** mobile-first, dark mode, installable as a PWA.
- **FastAPI backend (one process):** REST API plus server-sent events (SSE), ML engine, importer and matcher, batching manager, connectors, scheduler, and later the Telegram daemon.
- **SQLite file database:** every table carries user\_id. Alembic migrations keep a Postgres move easy.
- **Playwright bridge:** runs inside the backend with a persistent Chromium profile (folder .data/browser-profile, git-ignored) in headed mode, so your Blinkit login persists and you can watch it work.
- **Connector interface:** `search(query)`, `fill_cart(items)`, `get_cart()`, `capabilities()`. Implementations: SearchLinkConnector, MockConnector, BlinkitPlaywrightConnector (feature-flagged), and later InstamartMcpConnector.
- **LLM interface (Gemini, optional):** receipt OCR, matching leftover item names, voice transcription, anomaly hints. It always has a deterministic fallback and a fake for tests. It is never the core predictor.

**Consequences you should know about**

- Because Playwright uses your own logged-in browser, the backend must run on your own machine. A public hosted demo must run in demo mode with the mock connector.
- A Telegram button can trigger a cart fill only while your laptop is on and the backend is running.
- The Blinkit connector is unofficial. It may break whenever the site changes, and automating a site can conflict with its terms. Keep it for personal use. For a real startup, move to official partner or API routes such as the Instamart MCP.

## A5. User flow

1. **First run:** pick about 20 essentials from presets (or import past orders). Run the swipe audit to calibrate each item. Paste a Blinkit link per item now or later.
2. **Daily life:** the dashboard shows one card per item with a lifespan ring. One tap logs Finished, Opened next or Restocked.
3. **Nightly:** predictions refresh for every item, each with an earliest and latest plausible run-out date.
4. **When items are due:** the batching rule builds one draft restock order and notifies you.
5. **Review:** edit quantities, remove or add items, see the estimated total, then click Fill Blinkit Cart.
6. **Live progress:** the app adds each item and streams progress. At the end it shows the cart total and Cart ready.
7. **You pay:** open Blinkit, check the cart and pay yourself. Then mark the order as Ordered so the app records the new packs.
8. **Autonomy:** items that keep predicting well stop asking you questions.

## A6. UX specification

- **Lifespan ring or bar:** green (plenty), amber (low), crimson (due within 24 hours).
- **One-tap actions on every card:** Finished (closes the in-use pack and records a confirmed cycle), Opened next (moves an unopened pack to in use), Restocked (adds a new unopened pack dated today).
- **Swipe audit (onboarding):** right = full, up = running low (1 to 2 days), left = empty (needs buying). Each answer seeds the item’s first estimate. Twenty items should take under a minute.
- **Weekly check (swipe cards):** right = still have it, left = ran out. Only items that are due soon or uncertain appear.
- **Review screen:** quantity steppers, remove, add extra item, per-item reason (for example due in 1 day, or added to reach free delivery), estimated total, and a minimum-order banner.
- **Quality bar:** large touch targets, empty, loading and error states everywhere, dark mode, keyboard accessible.

## A7. Data model (SQLite)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY, email TEXT UNIQUE, display_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);   -- v1 seeds one default local user

CREATE TABLE settings (
  user_id TEXT REFERENCES users(id), key TEXT, value TEXT,
  PRIMARY KEY (user_id, key));
  -- lookahead_hours=48, min_order_value=199, review_buffer_days=2, max_extend_days=7

CREATE TABLE items (               -- generic item, e.g. Milk
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL, category TEXT NOT NULL, unit TEXT NOT NULL,
  default_pack_size REAL DEFAULT 1.0, initial_estimate_days INTEGER DEFAULT 7,
  stage TEXT DEFAULT 'learning',   -- learning | assisted | auto
  archived BOOLEAN DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE preferred_products (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  item_id TEXT REFERENCES items(id), platform TEXT DEFAULT 'BLINKIT',
  product_name TEXT, brand TEXT, pack_value REAL, pack_unit TEXT,
  product_url TEXT, platform_product_id TEXT, last_price REAL,
  default_qty INTEGER DEFAULT 1, is_active BOOLEAN DEFAULT 1);

CREATE TABLE purchases (           -- one row per bought pack or batch
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  item_id TEXT REFERENCES items(id), raw_name TEXT, brand TEXT,
  pack_value REAL, pack_unit TEXT, quantity REAL NOT NULL, price REAL,
  platform TEXT, order_ref TEXT, purchased_on DATE NOT NULL,
  status TEXT DEFAULT 'UNOPENED',  -- UNOPENED | IN_USE | DEPLETED
  opened_on DATE, depleted_on DATE,
  source TEXT,                     -- import | receipt | manual | restock_order
  UNIQUE (user_id, platform, order_ref, raw_name));

CREATE TABLE cycles (              -- derived and rebuilt by the pipeline
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  item_id TEXT REFERENCES items(id), purchase_id TEXT REFERENCES purchases(id),
  start_on DATE, end_on DATE, units REAL, duration_days REAL, days_per_unit REAL,
  is_confirmed BOOLEAN DEFAULT 0, is_outlier BOOLEAN DEFAULT 0, notes TEXT);

CREATE TABLE predictions (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  item_id TEXT REFERENCES items(id), made_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method TEXT, model_version TEXT, runout_on DATE, p10_on DATE, p90_on DATE,
  actual_runout_on DATE, abs_error_days REAL);

CREATE TABLE check_prompts (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  item_id TEXT REFERENCES items(id), asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answer TEXT, answered_at TIMESTAMP);   -- still_have | ran_out | skip

CREATE TABLE restock_orders (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  platform TEXT DEFAULT 'BLINKIT',
  status TEXT DEFAULT 'DRAFT',     -- DRAFT | NOTIFIED | POPULATING | CART_FILLED | ORDERED | DISMISSED
  estimated_total REAL, below_minimum BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, approved_at TIMESTAMP);

CREATE TABLE restock_order_items (
  id TEXT PRIMARY KEY, order_id TEXT REFERENCES restock_orders(id),
  item_id TEXT REFERENCES items(id), preferred_product_id TEXT REFERENCES preferred_products(id),
  suggested_qty REAL NOT NULL, final_qty REAL NOT NULL,
  reason TEXT, extended BOOLEAN DEFAULT 0,
  status TEXT DEFAULT 'PENDING');  -- PENDING | ADDED_TO_CART | OUT_OF_STOCK | FAILED | REMOVED

CREATE TABLE connector_runs (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), order_id TEXT,
  connector TEXT, status TEXT, items_added INTEGER, cart_total REAL,
  error TEXT, screenshot_path TEXT, started_at TIMESTAMP, finished_at TIMESTAMP);

CREATE TABLE import_jobs (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id), source TEXT,
  status TEXT, parsed_count INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE match_rules (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id),
  raw_pattern TEXT, item_id TEXT REFERENCES items(id));
```

Add indexes on (user\_id, item\_id, purchased\_on) and (user\_id, item\_id, made\_at).

## A8. ML design

### A8.1 Cycles

- When stock tracking exists, a **cycle** runs from the pack’s opened\_on (or purchased\_on if never marked opened) to its depleted\_on. This is **confirmed**.
- For imported history with no finish dates, a cycle runs from one purchase to the next purchase of the same item, divided by the units bought. This is **inferred**.
- Confirmed cycles carry about twice the weight of inferred ones.
- **Target:** days\_per\_unit. Predicted duration = days\_per\_unit × planned quantity.

### A8.2 Cleaning

- **Outliers:** a cycle is flagged when its duration is more than 2.5 times the item’s median, or when a median-absolute-deviation rule flags it (travel, illness, bulk buying). Flagged cycles stay stored but are excluded from training.
- Normalize pack sizes to units (1 L counts as 2 units of 500 ml).
- Merge purchases within one to two days into one restock.

### A8.3 Prediction ladder (hybrid adaptive engine)

| Stage | When | Method |
| --- | --- | --- |
| 0 Cold start | 0 to 1 cycles | Swipe audit answer or user estimate, else category default |
| 1 Adaptive smoothing | 2 to 4 cycles | Recency-weighted exponential moving average: D̂(t) = α·D(t) + (1 − α)·D̂(t − 1), with α = 0.4 |
| 2 Supervised | 5 or more cycles for the item, and at least 30 cycles overall | Global regression model blended with the moving average |

- **One global model across all items,** not one per item, so sparse items borrow patterns from similar ones. Start with Ridge as the simple baseline and RandomForest or gradient boosting as the challenger.
- **Features:** category, quantity bought, normalized pack size, start day of week, days since last purchase, rolling 7-day usage rate, last three durations, moving average, rolling spread, cycle count, confirmed share.
- **Confidence range:** quantile models (or residual spread) give an earliest p10 and latest p90 run-out date.
- **Champion and challenger:** an item moves to a more complex method only if it beats the simpler one in backtesting.

### A8.4 Autonomy stages

| Stage | Meaning | Promote when | Demote when |
| --- | --- | --- | --- |
| Learning | Asks for taps and weekly checks | Last 3 predictions within ±1 day | n/a |
| Assisted | Asks only when the p10 to p90 range is wide | Last 5 within ±1 day | Two misses of more than 2 days |
| Auto | Never asks, only appears in carts | n/a | Any miss of more than 3 days |

These thresholds are starting values to tune with simulation.

### A8.5 Evaluation

- Time-based splits only: train on the past, test on the future.
- Metrics: MAE in days, share within ±1 and ±2 days, p10 to p90 coverage (target about 80 percent), questions asked per week (must fall), and cart accuracy (share of cart items you kept).
- A **synthetic data simulator** generates 12 months for about 30 items with noise, stockpiling, trips and brand switches. It powers tests and the demo, and must be labeled synthetic everywhere.
- Every prediction is stored with its eventual error so the dashboard is real.

## A9. Batching rule (threshold batching with one-click trigger)

Settings (editable by the user): lookahead\_hours = 48, min\_order\_value = 199, review\_buffer\_days = 2, max\_extend\_days = 7.

1. **Due set:** items whose p10 run-out date is on or before now + lookahead\_hours + review buffer.
2. **Estimate** the total from each preferred product’s last known price × quantity.
3. If the due set is empty, build nothing.
4. If the estimate meets min\_order\_value, create the draft and notify.
5. If it falls short, **extend** with the soonest next items (p10 within max\_extend\_days) until the minimum is met, marking them as added to reach free delivery. If still short, create the draft with a below-minimum banner and let the user decide.
6. **Critical override:** if any item is due within 24 hours, notify immediately even when below the minimum.
7. Keep at most one open draft. Refresh it instead of creating duplicates.
8. **Quantity:** the preferred product’s default quantity, adjusted by predicted usage until the next expected restock.
9. The user reviews, edits and clicks **Fill Blinkit Cart**. That click is the approval.

## A10. Blinkit Playwright connector

**Flow**

1. One-time setup script opens a headed Chromium with the persistent profile so you log in to Blinkit yourself.
2. On Fill Blinkit Cart, the backend launches that profile and processes the order’s items one by one.
3. For each item: open its mapped product URL, check for an out-of-stock marker, click ADD or raise the quantity to the target, then emit a progress event (for example Added 2 x Amul Milk) over SSE.
4. At the end open the cart, read the item count and total, store a connector\_runs row, and show Cart ready.

**Guardrails (hard requirements)**

- Visit only mapped blinkit.com product URLs. No catalog scraping.
- Stop at the cart. Never click checkout, place order or pay. Never fill payment or address forms.
- Never attempt to bypass CAPTCHAs, bot checks or login challenges, and add no stealth plugins. If a challenge or expired login appears, pause, tell the user, and wait for them to resolve it in the visible browser window.
- Never store the user’s Blinkit password or OTP. The browser profile is the only session store and stays local.
- Keep all CSS selectors in one selectors module with fallbacks. Take a screenshot on any failure.
- Process at most 30 items per run, with a short pause between items.
- Out-of-stock or failed items are marked and offered as search links, and the run continues.
- Support dry-run mode (walk the flow without clicking ADD) and a mock Blinkit test site served from HTML fixtures.
- Gate it behind KIRANA\_ENABLE\_BLINKIT, which is false by default in demo mode.

## A11. Import, matching and receipts

1. Accept CSV or JSON exports, pasted order text, and receipt images or PDFs.
2. Parse raw lines (name, quantity, pack size, price, date, platform, order reference).
3. Match each raw line to a generic item: exact rules, then fuzzy matching, then the optional LLM, then ask the user.
4. Show a review screen. Nothing is committed until the user confirms.
5. De-duplicate by platform, order reference and line. Learned matches become saved rules.
6. Receipt scanning uses the LLM with vision and a strict JSON schema, then validates totals and dates.
7. Imported packs arrive as DEPLETED or inferred history, never as fake in-use stock.

## A12. API (REST under /api/v1, JSON)

| Area | Endpoints |
| --- | --- |
| Health and settings | GET /health, GET/PATCH /settings |
| Items | GET/POST /items, GET/PATCH/DELETE /items/{id}, PUT /items/{id}/preferred-product |
| Purchases and stock | GET/POST /purchases, PATCH/DELETE /purchases/{id}, POST /items/{id}/finished, POST /items/{id}/opened-next, POST /items/{id}/restocked |
| Onboarding | GET /presets, POST /audit/answers |
| Weekly check | GET /checks/pending, POST /checks/{id}/answer |
| Import | POST /imports, GET /imports/{id}, POST /imports/{id}/confirm, POST /receipts/scan |
| Predictions | GET /predictions, GET /items/{id}/prediction, POST /predictions/recompute |
| Restock orders | GET /orders/current, POST /orders/generate, PATCH /orders/{id}/items/{item\_id}, POST /orders/{id}/populate, GET /orders/{id}/populate/stream (SSE), POST /orders/{id}/mark-ordered, POST /orders/{id}/dismiss |
| Connectors | GET /connectors, POST /connectors/blinkit/setup, GET /connectors/runs |
| Insights | GET /insights/accuracy, GET /insights/effort |
| Account | GET /me/export, DELETE /me |

Errors share one shape: `{ error: { code, message, details } }`. List endpoints support pagination.

## A13. Security and safety

- No order is ever placed or paid by the app.
- Local-first: the database and browser profile live on the user’s machine. Both are git-ignored.
- Secrets only in .env, with a committed .env.example.
- Optional Telegram and LLM keys are stored in .env, never in the database.
- Export and delete-my-data endpoints exist from the start.
- Logs never contain cookies, tokens or full page HTML.

## A14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Blinkit changes its site | Selectors module, screenshots, search-link fallback, mock site tests, early spike |
| Blinkit terms or bot checks | Personal use only, human-in-the-loop on challenges, no evasion, feature flag, official routes for startup |
| Too little data to learn | Swipe audit, import with inference, global model, labeled synthetic data |
| Stockpiling and travel distort gaps | UNOPENED, IN\_USE and DEPLETED states, outlier rules, quantity normalization |
| Wrong prediction causes waste | Human approval, p10 inclusion, trust demotion on misses |
| Laptop off when triggered from Telegram | Clear message in the bot, queue the request until the backend is back |
| Scope creep | Phase exit criteria, backlog file |

## A15. Demo script

1. Run the swipe audit and import a real order history.
2. Open an item and show the predicted run-out with its confidence band.
3. Show the effort chart: questions per week falling over simulated weeks.
4. Receive the draft restock order, edit one line, click Fill Blinkit Cart.
5. Watch live progress, then open Blinkit and pay yourself.
6. Close on the accuracy dashboard: error in days falling as data grows.
