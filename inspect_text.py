import sqlite3

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT extracted_text FROM cases WHERE rowid = 2627")
row = c.fetchone()
if row:
    print(f"Extracted Text:\n{row[0]}")
else:
    print("Case not found.")
conn.close()
