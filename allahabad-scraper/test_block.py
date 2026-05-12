import requests
import base64
import time

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0'})
session.get('https://elegalix.allahabadhighcourt.in/elegalix/WebStartJudgmentDateSearch.do')
cap = base64.b64decode(session.get('https://elegalix.allahabadhighcourt.in/elegalix/getData?action=generateCaptcha').text.strip()).decode()
session.post('https://elegalix.allahabadhighcourt.in/elegalix/WebJudgmentDateSearch.do', data={'highCourtBenchCode': 'X', 'fromDay': '1', 'fromMonth': '5', 'fromYear': '2026', 'toDay': '12', 'toMonth': '5', 'toYear': '2026', 'securityCode': cap, 'submit': 'Submit'})

# Spam to get blocked
for i in range(1, 10):
    r = session.get(f'https://elegalix.allahabadhighcourt.in/elegalix/WebShowResults.do?pagenumber={i}')
    print(f"Page {i}: Status {r.status_code}, Length {len(r.text)}")
    if "blocked" in r.text.lower() or r.status_code != 200:
        print("BLOCKED!")
        print(r.text[:500])
        break
