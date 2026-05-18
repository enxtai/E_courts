from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('https://services.ecourts.gov.in/ecourtindia_v6/?p=courtorder/index', timeout=60000)
        page.wait_for_selector('#sess_state_code')
        states = page.evaluate('''() => {
            const select = document.getElementById("sess_state_code");
            return Array.from(select.options)
                .filter(opt => opt.value && opt.value !== "0")
                .map(opt => ({ value: opt.value, text: opt.text }));
        }''')
        for s in states:
            print(f"{s['value'].zfill(2)} - {s['text']}")
        browser.close()

if __name__ == '__main__':
    run()
