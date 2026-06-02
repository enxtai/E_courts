import sqlite3
import re

# Define the regex pattern used in the API
pattern = re.compile(r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s*[:\-]\s*(.*)', re.IGNORECASE)

conn = sqlite3.connect(r"D:\ETL\eCourts_Portal\backend\courtdb.sqlite")
c = conn.cursor()
c.execute("SELECT rowid, extracted_text FROM cases")
rows = c.fetchall()

for rowid, text in rows:
    if text and pattern.search(text):
        print(f"Found match: RowID {rowid}")
        # Print the first few matches to confirm
        matches = pattern.findall(text)
        for m in matches:
            print(f"  Match: {m}")
        break # Just need one example

conn.close()
