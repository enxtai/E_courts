import asyncio
import argparse
from datetime import datetime
from pathlib import Path
from bharat_courts.sci.client import SCIClient, SCI_JUDGMENTS_URL
from bharat_courts.sci.parser import parse_judgment_list

async def download_sc_judgments(start_date: str, end_date: str, output_dir: str):
    """
    Downloads Supreme Court judgments within a specified date range.
    Dates should be in YYYY-MM-DD format.
    """
    # Convert YYYY-MM-DD to DD-MM-YYYY for the SC portal
    def format_date(date_str):
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return dt.strftime("%d-%m-%Y")

    from_date = format_date(start_date)
    to_date = format_date(end_date)

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    print(f"Searching for judgments from {from_date} to {to_date}...")

    async with SCIClient() as client:
        form_data = {
            "JBJfrom": from_date,
            "JBJto": to_date,
            "joession": "",
        }
        
        # Use the internal http client to post and the internal parser to get judgments
        resp = await client._http.post(SCI_JUDGMENTS_URL, data=form_data)
        judgments = parse_judgment_list(resp.text, base_url="https://main.sci.gov.in")
        
        if not judgments:
            print("No judgments found for the given date range.")
            return

        print(f"Found {len(judgments)} judgments. Starting download...")

        for i, judgment in enumerate(judgments, 1):
            print(f"[{i}/{len(judgments)}] Downloading: {judgment.title}")
            
            # Download the PDF
            judgment = await client.download_pdf(judgment)
            
            if judgment.pdf_bytes:
                # Create a safe filename
                safe_title = "".join([c for c in judgment.title if c.isalnum() or c in (' ', '_', '-')]).strip()
                filename = f"{judgment.judgment_date or 'unknown_date'}_{safe_title[:100]}.pdf"
                file_path = output_path / filename
                
                with open(file_path, "wb") as f:
                    f.write(judgment.pdf_bytes)
            else:
                print(f"  Failed to download PDF for {judgment.title}")

    print(f"Finished. Judgments saved to {output_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Supreme Court judgments by date.")
    parser.add_argument("--start", required=True, help="Start date in YYYY-MM-DD format")
    parser.add_argument("--end", required=True, help="End date in YYYY-MM-DD format")
    parser.add_argument("--out", default="sc_judgments", help="Output directory (default: sc_judgments)")

    args = parser.parse_args()

    try:
        asyncio.run(download_sc_judgments(args.start, args.end, args.out))
    except Exception as e:
        print(f"An error occurred: {e}")
