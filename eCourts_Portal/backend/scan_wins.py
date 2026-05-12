import sqlite3
import requests
import json

c = sqlite3.connect('courtdb.sqlite')
# Get cases with lawyers and judges, excluding the one we manually modified (id=1445)
res = c.execute("SELECT lawyers, judges FROM cases WHERE lawyers != '' AND judges != '' AND rowid != 1445 LIMIT 500").fetchall()

print(f"Testing {len(res)} cases for authentic wins...")
found = False

for lawyer, judge in res:
    lawyer_first = lawyer.split(',')[0].strip()
    judge_first = judge.split(',')[0].strip()
    try:
        data = requests.get(f'http://localhost:8000/api/analytics/win-ratio?lawyer={lawyer_first}&judge={judge_first}').json()
        if data.get('wins', 0) > 0:
            print(f"AUTHENTIC WIN FOUND! Lawyer: {lawyer_first}, Judge: {judge_first}")
            print(json.dumps(data, indent=2))
            found = True
            break
    except Exception as e:
        pass

if not found:
    print("No authentic wins found in the first 100 cases.")
