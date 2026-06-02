import re

def parse_history(text, year):
    month_pattern = r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?'
    date_pattern = rf'(?:\d{{1,2}}(?:st|nd|rd|th)?\s+{month_pattern}|{month_pattern}\s+\d{{1,2}}(?:st|nd|rd|th)?)(?:\s*,?\s*\d{{4}})?'
    sentences = re.split(r'[.!?]\s+', text)
    events = []
    for sentence in sentences:
        match = re.search(date_pattern, sentence, re.IGNORECASE)
        if match:
            date_str = match.group(0).strip()
            if not re.search(r'\d{4}', date_str):
                formatted_date = f"{date_str}, {year}"
            else:
                formatted_date = date_str
            events.append({
                "date": formatted_date,
                "description": sentence.strip()
            })
    return events

text = "[Part 1]: The Bharat Bank Ltd., Delhi, filed an appeal by special leave under Article 136 of the Constitution against a determination of an industrial dispute by an Industrial Tribunal. The dispute arose after employees of the bank struck work on March 9, 1949, following an unfavourable response to their demands, leading the bank to discharge several employees. The Industrial Tribunal's award, made on January 19, 1950, was declared binding for one year. The primary legal question was whether the"
year = "1950"

events = parse_history(text, year)
for e in events:
    print(e)

