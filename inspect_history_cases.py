import sqlite3

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT rowid, extracted_text FROM cases WHERE rowid IN (2656, 2658, 2659)")
rows = c.fetchall()
for rowid, text in rows:
    print(f"RowID: {rowid}")
    print(f"Text snippet: {text[:500]}")
    print("-" * 20)
conn.close()
