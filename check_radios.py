import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating...")
        await page.goto("https://judgments.ecourts.gov.in/pdfsearch/index.php")
        
        # Select high court
        await page.select_option("#fcourt_type", "2")
        await asyncio.sleep(2) # wait for AJAX
        
        html = await page.content()
        with open("dump.html", "w", encoding="utf-8") as f:
            f.write(html)
            
        print("Extracting exampleRadios values...")
        radios = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('input[name="exampleRadios"]')).map(r => ({id: r.id, value: r.value}));
        }""")
        print("exampleRadios:", radios)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
