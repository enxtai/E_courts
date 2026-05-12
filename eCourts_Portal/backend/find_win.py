import sqlite3
import requests

c = sqlite3.connect('courtdb.sqlite')
res = c.execute("SELECT lawyers, judges FROM cases WHERE lawyers != '' AND judges != '' LIMIT 15").fetchall()

for lawyer, judge in res:
    lawyer_first = lawyer.split()[0]
    judge_first = judge.split()[0]
    try:
        data = requests.get(f'http://localhost:8000/api/analytics/win-ratio?lawyer={lawyer_first}&judge={judge_first}').json()
        if data.get('wins', 0) > 0:
            print(f"WIN FOUND! Lawyer: {lawyer_first}, Judge: {judge_first}")
            break
    except Exception as e:
        pass
else:
    print("No wins found in the first 15.")
