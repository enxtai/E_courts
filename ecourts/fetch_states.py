import urllib.request
import re

html = urllib.request.urlopen('https://services.ecourts.gov.in/ecourtindia_v6/?p=courtorder/index').read().decode('utf-8', errors='ignore')
matches = re.findall(r'<option\s+value="(\d+)"[^>]*>([^<]+)</option>', html)
for m in matches:
    if m[0] != '0':
        print(f"{m[0].zfill(2)} - {m[1].strip()}")
