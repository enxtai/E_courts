from bs4 import BeautifulSoup
import re

html = '<a href="WebShowResults.do?pagenumber=1">Next &gt;</a>'
soup = BeautifulSoup(html, 'html.parser')
tag = soup.find('a', string=re.compile("Next"))
print(tag)
