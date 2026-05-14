import requests

def main():
    print("Requesting DOM dump from active session...")
    res = requests.get("http://localhost:8000/status")
    print(res.json())
    
    # Actually, main.py doesn't have a /dump-html endpoint.
    # I should add one or just use a python script that connects to the same playwright if I can?
    # No, I can't connect to the same playwright from a different process.
    # I must add a /dump-html endpoint to main.py temporarily.
    
if __name__ == "__main__":
    main()
