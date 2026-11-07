# Product Backlog & Future Phase Ideas

## Phase 1: Core Tracking & Calibration
- Generic item management with categories, default pack sizes, initial estimates.
- Preferred product mapping (exact Blinkit links, brand, size, last price).
- One-tap status updates: `Finished`, `Opened next`, `Restocked`.
- Swipe audit onboarding flow.

## Phase 2: History Import & Inferred Cycles
- CSV/JSON order history parser.
- Match rules and heuristic line item matcher.
- Inferred cycle computation from repurchase intervals.

## Phase 3: Prediction Engine
- Recency-weighted EMA (Stage 1).
- Global scikit-learn Ridge & Random Forest quantile predictors (Stage 2).
- P10/P90 confidence ranges.
- Trust stage promotions and demotions.

## Phase 4: Restock Order Batching
- Threshold batching rule implementation.
- Draft order review UI with quantity adjustments.

## Phase 5: Blinkit Connector Integration
- Full `BlinkitPlaywrightConnector` under `KIRANA_ENABLE_BLINKIT`.
- Real-time SSE cart-filling progress.
- Out-of-stock handling with search link fallbacks.

## Phase 6-8 (Post-MVP)
- Telegram bot interface for voice and text restock logging.
- Swiggy Instamart MCP connector.
- Multi-user households and cloud sync.
