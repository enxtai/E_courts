import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://judgments.ecourts.gov.in/pdfsearch/index.php")
        
        # Trigger High Court selection
        await page.select_option("#fcourt_type", "2")
        await page.dispatch_event("#fcourt_type", "change")
        
        print("Initial selects:", await page.evaluate("() => Array.from(document.querySelectorAll('select')).map(s => s.id)"))
        
        # Click "Advanced Search" if it exists
        adv = await page.query_selector("text=Advanced Search")
        if adv:
            print("Clicking Advanced Search...")
            await adv.click()
            await asyncio.sleep(2)
        
        print("Selects after Adv Search:", await page.evaluate("() => Array.from(document.querySelectorAll('select')).map(s => s.id)"))
        
        # Wait for any new elements
        await asyncio.sleep(5)
        print("Final selects:", await page.evaluate("() => Array.from(document.querySelectorAll('select')).map(s => s.id)"))
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
