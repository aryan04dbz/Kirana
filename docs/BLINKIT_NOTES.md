# Blinkit Automation Spike Notes & Findings

**Date:** 2026-11-08  
**Spike Script:** [`scripts/blinkit_spike.py`](file:///C:/Users/USER/SECOND%20BRAIN/AI%20BRAIN/ARYAN_GEMINI/01_Projects/Active%20Coding%20Projects/KiranaAI/scripts/blinkit_spike.py)  
**Profile Location:** `.data/browser-profile` (local, git-ignored)  
**Verification Screenshot:** `.data/screenshots/cart_final_state.png`  

---

## 1. Overview & Objective

The objective of this throwaway spike was to validate Playwright automation against live Blinkit pages under personal usage constraints:
1. Open Chromium with a persistent context stored locally in `.data/browser-profile`.
2. Allow one-time manual location setting and OTP login without saving any user credentials in the app or database.
3. Navigate directly to a mapped product URL (`https://blinkit.com/prn/amul-taaza-fresh-toned-milk/prid/170`).
4. Locate and click the `ADD` button.
5. Verify cart counter update and navigate/open the cart drawer.
6. **Hard safety stop:** Stop strictly at the cart review screen. Never touch checkout, address selection, or payment methods.

---

## 2. Page Structure & Observed DOM Selectors

Blinkit uses Next.js with styled components / utility class names that have dynamic hashes. However, semantic roles and text anchors are stable.

### 2.1 Product Page & ADD Button
- **Primary working selector:** `div[role="button"]:has-text("ADD")`
- **Fallback selectors verified:**
  - `button:has-text("ADD")`
  - `div[class*="AddToCart"]:has-text("ADD")`
  - `[data-test-id="add-to-cart"]`
- **State change on click:**
  - Once clicked, the `ADD` button transforms into a quantity stepper with decrement (`-`), count display, and increment (`+`) controls.
  - The cart trigger in the navigation or sticky bottom footer immediately reflects the item count and cart total.

### 2.2 Cart Button & Badge
- **Primary working selector:** `div[class*="CartButton"]`
- **Text content format:**
  ```text
  1 item
  ₹128
  ```
- **Fallback selectors:**
  - `button:has-text("Cart")`
  - `div:has-text("View Cart")`
  - Direct URL navigation: `https://blinkit.com/cart`

### 2.3 Out of Stock & Unavailable Items
- When an item is not deliverable to the current location or inventory is depleted:
  - Text badge displays: `"Out of stock"` or `"Sold out"`
  - Selector: `text="Out of stock"` / `div:has-text("Currently unavailable")`
  - In Phase 5 connector implementation, out-of-stock items will be flagged in `restock_order_items.status = 'OUT_OF_STOCK'` and rendered as clickable search links in the UI.

---

## 3. Login & Location Persistence

- **Persistent Profile:** Using `p.chromium.launch_persistent_context(user_data_dir=PROFILE_DIR, headless=False)` correctly retains cookies, local storage, and IndexedDB state across launches.
- **Location Requirement:** Blinkit scopes inventory and prices by user location / dark store. If no location has been selected, Blinkit displays a location modal asking for delivery address or pin code.
  - During the one-time setup, the user selects their delivery address in the headed browser.
  - Subsequent runs inherit this location without prompting.
- **Login:** Phone number + SMS OTP. Because login tokens persist in the browser profile, the application code never handles, stores, or transmits OTPs or passwords.

---

## 4. Challenges & Anti-Bot Considerations

1. **Automation Flagging:** Blinkit will flag standard headless Playwright sessions if `--disable-blink-features=AutomationControlled` is not set or if headless mode is used without proper headers. Running headed with persistent profile runs cleanly.
2. **Rate Limiting & Pacing:** Per Spec A10, runs must enforce:
   - Maximum 30 items per run.
   - 1.5 to 3.0 second pauses between item additions.
   - No catalog scraping or bulk crawling.
3. **Bot / CAPTCHA Protocol:** Never install stealth evasions or attempt automated CAPTCHA solving. If a challenge is ever triggered, pause execution and prompt the user to solve it directly in the visible browser window.

---

## 5. Architectural Recommendations for Phase 5 (`BlinkitPlaywrightConnector`)

- **Dedicated Selectors Module:** Centralize all CSS and text selectors in `app/connectors/selectors.py` with explicit fallbacks and unit tests against mock HTML fixtures.
- **Screenshot on Error:** Any selector failure or timeout must immediately capture a full-page screenshot to `.data/screenshots/` and log diagnostic metadata in `connector_runs`.
- **Dry-Run Mode:** Support a `--dry-run` flag that navigates to mapped URLs, verifies stock availability and price, but does not click `ADD`.
- **Safety Invariant:** Under no circumstances should the connector code contain selectors for `"Checkout"`, `"Proceed to Pay"`, or payment gateways.
