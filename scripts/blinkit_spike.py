"""Blinkit Playwright Spike (Throwaway Prototype).

Purpose:
1. Open headed Chromium with a persistent browser profile in .data/browser-profile.
2. Allow one-time manual login / location selection if needed.
3. Open a single mapped product URL.
4. Locate and click the ADD button.
5. Read cart item count.
6. Navigate/open cart and STOP AT CART (NEVER checkout or pay).
7. Save failure screenshots to .data/screenshots.
"""

import sys
import time
from pathlib import Path

from playwright.sync_api import BrowserContext, Locator, Page, sync_playwright

# Repository root and persistent profile directory
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / ".data"
PROFILE_DIR = DATA_DIR / "browser-profile"
SCREENSHOTS_DIR = DATA_DIR / "screenshots"

DEFAULT_PRODUCT_URL = "https://blinkit.com/prn/amul-taaza-fresh-toned-milk/prid/170"

# Common selectors with fallbacks per Spec A10
SELECTORS: dict[str, list[str]] = {
    "add_button": [
        'button:has-text("ADD")',
        'div[role="button"]:has-text("ADD")',
        '[data-test-id="add-to-cart"]',
        'div[class*="AddToCart"]:has-text("ADD")',
        'div:has-text("ADD"):not(:has(*))',
    ],
    "cart_button": [
        'button:has-text("Cart")',
        'div:has-text("View Cart")',
        'div:has-text("items in cart")',
        'a[href*="/cart"]',
        '[data-test-id="view-cart-button"]',
        'div[class*="CartButton"]',
    ],
    "cart_count": [
        '[data-test-id="cart-count"]',
        'div[class*="CartCount"]',
        'div[class*="badge"]',
        'span[class*="cart-badge"]',
    ],
    "out_of_stock": [
        'text="Out of stock"',
        'text="Sold out"',
        'div:has-text("Currently unavailable")',
    ],
}


def ensure_directories() -> None:
    """Ensure runtime data directories exist."""
    PROFILE_DIR.mkdir(parents=True, exist_ok=True)
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)


def take_error_screenshot(page: Page, step_name: str) -> Path:
    """Capture page state on error or unexpected flow."""
    timestamp = int(time.time())
    dest = SCREENSHOTS_DIR / f"failure_{step_name}_{timestamp}.png"
    page.screenshot(path=str(dest), full_page=True)
    print(f"Captured debug screenshot at: {dest}")
    return dest


def find_element_with_fallbacks(
    page: Page, selector_key: str, timeout: int = 5000
) -> tuple[Locator | None, str | None]:
    """Attempt each fallback selector in order."""
    selectors = SELECTORS.get(selector_key, [])
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=timeout):
                return loc, sel
        except Exception:
            continue
    return None, None


def run_spike(product_url: str) -> None:
    """Run headed Blinkit browser automation spike."""
    ensure_directories()
    print("==================================================")
    print("  KiranaAI - Blinkit Automation Spike (Playwright)")
    print("==================================================")
    print(f"Profile directory: {PROFILE_DIR}")
    print(f"Product URL:       {product_url}")
    print("Safety rule:       STOPS AT CART. Never checkout or pay.\n")

    with sync_playwright() as p:
        print("Launching headed Chromium with persistent profile...")
        context: BrowserContext = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            headless=False,
            channel="chromium",
            viewport={"width": 1280, "height": 800},
            args=["--disable-blink-features=AutomationControlled"],
        )

        page = context.new_page()

        try:
            print(f"Navigating to product page: {product_url}...")
            page.goto(product_url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(3000)

            # Check if location prompt / modal is blocking
            print("Checking if location or login is required...")
            print(
                "NOTE: If Blinkit asks for location/login, "
                "resolve it directly in the open browser."
            )

            # Check for Out of Stock
            oos_loc, _ = find_element_with_fallbacks(page, "out_of_stock", timeout=2000)
            if oos_loc:
                print("[INFO] Item is marked Out of Stock on Blinkit.")
                take_error_screenshot(page, "out_of_stock")
                return

            # Look for ADD button
            print("Searching for ADD button...")
            add_button, matched_sel = find_element_with_fallbacks(
                page, "add_button", timeout=6000
            )

            if not add_button:
                print("[WARNING] Could not locate ADD button automatically.")
                take_error_screenshot(page, "add_button_not_found")
                if sys.stdin.isatty():
                    print("Press Enter in terminal after inspecting window...")
                    input()
                else:
                    page.wait_for_timeout(5000)
            else:
                print(f"[SUCCESS] Located ADD button via selector: {matched_sel}")
                add_button.scroll_into_view_if_needed()
                add_button.click()
                print("Clicked ADD button! Waiting 3 seconds for state update...")
                page.wait_for_timeout(3000)

            # Check cart count / cart button
            print("Looking for cart view / cart item count...")
            cart_btn, cart_sel = find_element_with_fallbacks(
                page, "cart_button", timeout=5000
            )
            if cart_btn:
                print(f"[SUCCESS] Located Cart trigger with: {cart_sel}")
                cart_text = cart_btn.inner_text()
                print(f"Cart details: {cart_text.strip()}")
                cart_btn.click()
                page.wait_for_timeout(2000)
            else:
                print("[INFO] Cart button fallback: Opening /cart URL directly...")
                page.goto("https://blinkit.com/cart", wait_until="domcontentloaded")
                page.wait_for_timeout(2000)

            # Final check: STOP AT CART
            print("\n==================================================")
            print("  STOP AT CART REACHED!")
            print("  App stopped safely at the cart review screen.")
            print("  No checkout or payment automated per rule #2.")
            print("==================================================")

            final_screenshot = SCREENSHOTS_DIR / "cart_final_state.png"
            page.screenshot(path=str(final_screenshot))
            print(f"Saved final cart review screenshot: {final_screenshot}")

            print("\nInspect the open browser window.")
            if sys.stdin.isatty():
                input("Press [Enter] to exit and close browser...")
            else:
                page.wait_for_timeout(5000)

        except Exception as exc:
            print(f"[ERROR] Exception during spike execution: {exc}")
            take_error_screenshot(page, "exception")
        finally:
            context.close()
            print("Browser context closed.")


if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PRODUCT_URL
    run_spike(target_url)
