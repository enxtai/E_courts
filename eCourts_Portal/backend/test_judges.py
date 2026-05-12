import sqlite3
c=sqlite3.connect('courtdb.sqlite')
res = c.execute("SELECT judges FROM cases WHERE lawyers LIKE '%V K Khare%'").fetchall()
print(res)
