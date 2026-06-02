import sqlite3

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT year, extracted_text FROM cases WHERE rowid = 2627")
row = c.fetchone()
if row:
    print(f"Year: {row[0]}")
    print(f"Extracted Text (first 500 chars):\n{row[1][:500]}")
else:
    print("Case not found.")
conn.close()
