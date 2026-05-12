import requests

url = "http://localhost:8000/api/chat"
payload = {
    "message": "Can you tell me about the case?",
    "user_id": "OAEMgAbfrde4YyjCr2tGTTBvsfS2",
    "history": []
}

try:
    response = requests.post(url, json=payload)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print(f"Error: {e}")
