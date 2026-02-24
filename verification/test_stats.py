from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    print("Navigating to home...")
    # 1. Go to home
    page.goto("http://localhost:3000")

    print("Filling username...")
    # Fill username
    page.fill("input[placeholder='DarkShadow1107']", "torvalds")

    print("Opening settings...")
    # Open settings popover. It's the button with the adjust icon.
    # We can find it by finding the button that contains the adjust icon or is the second button in the form row.
    # The theme button has role="combobox". The adjust button does not.
    settings_btn = page.locator("form button:not([role='combobox']):not([type='submit'])")
    settings_btn.click()

    # Wait for popover content
    page.wait_for_selector("text=Update card preferences")

    print("Checking default grade format...")
    # Check if Numeric Grade is ON by default
    switch = page.locator("button#gradeFormat")
    is_checked = switch.get_attribute("data-state") == "checked"
    if not is_checked:
        print("ERROR: Default grade format is NOT numeric!")
    else:
        print("Default grade format is numeric.")

    # Close popover by clicking outside or just submitting.
    # We can just click the submit button.

    print("Submitting form (Numeric)...")
    page.click("button[type='submit']")

    # Wait for navigation
    # The URL should contain grade_format=number
    page.wait_for_url("**/user/torvalds?**grade_format=number**")
    print("Navigated to user page.")

    # Wait for the stats image to load. This might take a while as it fetches from GitHub API.
    # The image has alt="github stats"
    # We wait for the image to be present. Loading might take time.
    # We can wait for the network to be idle or just wait a fixed time if needed, but selector is better.
    page.wait_for_selector("img[alt='github stats']")

    # Wait a bit more for the image to fully render/load
    page.wait_for_timeout(5000)

    # Take screenshot of numeric grade
    page.screenshot(path="verification/numeric_grade.png", full_page=True)
    print("Numeric grade screenshot taken: verification/numeric_grade.png")

    # Go back to home
    page.goto("http://localhost:3000")

    # Fill username again (state might be lost on navigation)
    page.fill("input[placeholder='DarkShadow1107']", "torvalds")

    print("Opening settings again...")
    settings_btn.click()
    page.wait_for_selector("text=Update card preferences")

    print("Toggling grade format to Letter...")
    # Toggle switch to OFF (Letter)
    page.click("button#gradeFormat")

    print("Submitting form (Letter)...")
    page.click("button[type='submit']")

    # Wait for navigation
    page.wait_for_url("**/user/torvalds?**grade_format=letter**")

    # Wait for image
    page.wait_for_selector("img[alt='github stats']")
    page.wait_for_timeout(5000)

    # Take screenshot of letter grade
    page.screenshot(path="verification/letter_grade.png", full_page=True)
    print("Letter grade screenshot taken: verification/letter_grade.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
