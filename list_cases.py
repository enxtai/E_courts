import sqlite3

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT rowid, year, title FROM cases LIMIT 5")
rows = c.fetchall()
for row in rows:
    print(f"RowID: {row[0]}, Year: {row[1]}, Title: {row[2]}")
conn.close()
