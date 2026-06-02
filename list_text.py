import sqlite3

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT rowid, extracted_text FROM cases LIMIT 10")
rows = c.fetchall()
for row in rows:
    print(f"RowID: {row[0]}, Text snippet: {row[1][:100]}")
conn.close()
