import requests
import time

def main():
    print("Triggering scrape with NO DATES...")
    scrape_req = {
        "court_name": "Allahabad High Court",
        "court_id": "9",
        "keyword": "",
        "start_date": "",
        "end_date": "",
        "metadata_only": True
    }
    res = requests.post("http://localhost:8000/scrape", json=scrape_req)
    print(res.json())
    
    print("Waiting for scrape to finish...")
    for _ in range(10):
        status = requests.get("http://localhost:8000/status").json()
        print(f"Status: {status['status']}, Found: {status['total_found']}")
        if status["status"] in ["ready", "error", "idle"] and status["total_found"] > 0:
            break
        time.sleep(2)
        
if __name__ == "__main__":
    main()
