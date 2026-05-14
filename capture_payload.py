import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Enable request interception
        requests = []
        page.on("request", lambda request: requests.append(request) if "get_search_data" in request.url else None)
        
        await page.goto("https://judgments.ecourts.gov.in/pdfsearch/index.php")
        
        # Fill form
        await page.fill("#search_text", "test")
        await page.fill("#captcha", "1234")
        
        print("Triggering validateCaptcha('Y')...")
        await page.evaluate("() => { validateCaptcha('Y'); }")
        await asyncio.sleep(5)
        
        if not requests:
            print("No requests captured. Searching for all outgoing requests...")
            page.on("request", lambda request: print(f"OUTGOING: {request.url}"))
            await page.evaluate("() => { validateCaptcha('Y'); }")
            await asyncio.sleep(2)

        for req in requests:
            print(f"URL: {req.url}")
            print(f"Method: {req.method}")
            print(f"Post Data: {req.post_data}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
