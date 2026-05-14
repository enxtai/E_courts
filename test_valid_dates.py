import requests
import time

def main():
    print("Triggering scrape with VALID DATES (Jan 2024)...")
    scrape_req = {
        "court_name": "Allahabad High Court",
        "court_id": "9",
        "keyword": "",
        "start_date": "01-01-2024",
        "end_date": "31-01-2024",
        "metadata_only": True
    }
    res = requests.post("http://localhost:8000/scrape", json=scrape_req)
    print(res.json())
    
if __name__ == "__main__":
    main()
