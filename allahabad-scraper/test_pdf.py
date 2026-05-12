import requests
import base64

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0'})

# Start the download CAPTCHA page (this sets the session and cookie)
# Note: Is it required to hit WebDownloadJudgmentDocument.do GET first?
# Usually, hitting the CAPTCHA image/audio or getData sets the token in the session directly.
r_ajax = session.get('https://elegalix.allahabadhighcourt.in/elegalix/getData?action=generateCaptcha')
cap = base64.b64decode(r_ajax.text.strip()).decode()

r_post = session.post(
    'https://elegalix.allahabadhighcourt.in/elegalix/WebDownloadJudgmentDocument.do',
    data={
        'judgmentID': '13367304',
        'subseq': 'no',
        'securitycode': cap
    }
)

with open('test.pdf', 'wb') as f:
    f.write(r_post.content)

print(f"Downloaded test.pdf with size: {len(r_post.content)} bytes, Content-Type: {r_post.headers.get('Content-Type')}")
