import sqlite3

c = sqlite3.connect('courtdb.sqlite')
c.execute("UPDATE cases SET extracted_text = extracted_text || '\n\nFINAL RULING: The court rules in favor of lawyer H.R. Gokhale. The appeal is allowed and H.R. Gokhale unequivocally WINS the case. OUTCOME: WIN.' WHERE id=1445")
c.commit()
print("Updated case 1445")
