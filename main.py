import os
import json
import asyncio
import re
import base64
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup
from session_grabber import ECourtsSession
from logger import log_event, get_logs, setup_logging

setup_logging()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

current_session = None
scraper_status = {
    "status": "idle",
    "progress": 0,
    "current_court": None,
    "total_found": 0,
    "total_downloaded": 0,
    "last_error": None
}

class ScrapeRequest(BaseModel):
    court_name: str
    court_id: str
    keyword: str = ""
    start_date: str = ""   # YYYY-MM-DD from frontend
    end_date: str = ""     # YYYY-MM-DD from frontend
    metadata_only: bool = False

@app.get("/status")
async def get_status():
    status_copy = scraper_status.copy()
    status_copy["logs"] = get_logs()
    return status_copy

async def background_capture_session():
    global current_session
    try:
        scraper_status["status"] = "awaiting_captcha"
        success = await current_session.capture_session()
        if success:
            scraper_status["status"] = "ready"
        else:
            scraper_status["status"] = "idle"
            log_event("Session initialization failed.", "error")
    except Exception as e:
        scraper_status["status"] = "idle"
        log_event(f"Session Error: {str(e)}", "error")

@app.post("/start-session")
async def start_session(background_tasks: BackgroundTasks):
    global current_session
    current_session = ECourtsSession()
    background_tasks.add_task(background_capture_session)
    return {"message": "Session grabber initialized"}

def normalize_dates(start_date, end_date):
    """Keep dates in YYYY-MM-DD format - that is what the server expects."""
    return start_date, end_date


async def run_scraper(request: ScrapeRequest):
    global current_session
    try:
        scraper_status["status"] = "scraping"
        scraper_status["current_court"] = request.court_name
        scraper_status["total_downloaded"] = 0
        scraper_status["total_found"] = 0
        scraper_status["progress"] = 0

        # Normalize dates
        from_date, to_date = normalize_dates(request.start_date, request.end_date)

        # Output directories: separate metadata and PDFs
        run_folder = f"{request.start_date}_to_{request.end_date}".replace("-", "_")
        meta_dir = Path(f"scraped_judgments/metadata/{request.court_name}/{run_folder}")
        pdf_dir = Path(f"scraped_judgments/pdfs/{request.court_name}/{run_folder}")
        meta_dir.mkdir(parents=True, exist_ok=True)
        pdf_dir.mkdir(parents=True, exist_ok=True)

        log_event(f"Starting scrape for {request.court_name} ({from_date} -> {to_date})...", "net")
        log_event(f"Output: metadata -> {meta_dir}", "info")
        log_event(f"Output: pdfs -> {pdf_dir}", "info")

        page = current_session.page
        state_code = request.court_id

        # Resolve court code from dynamic map if available
        if request.court_name in current_session.court_map:
            state_code = current_session.court_map[request.court_name]
            log_event(f"Resolved court code: {state_code}", "scraper")

        # Concurrency limiter for PDF downloads — low because open_pdf() manipulates DOM
        download_sem = asyncio.Semaphore(3)

        async def download_one(jid, fname, meta):
            """Download a single PDF + save metadata."""
            async with download_sem:
                try:
                    # Always save metadata
                    with open(meta_dir / f"{fname}.json", "w", encoding="utf-8") as f:
                        json.dump(meta, f, indent=2, ensure_ascii=False)

                    if request.metadata_only:
                        scraper_status["total_downloaded"] += 1
                        return

                    # Download PDF via browser context
                    b64 = await current_session.download_pdf_binary(jid)
                    if b64:
                        pdf_bytes = base64.b64decode(b64)
                        if len(pdf_bytes) > 100 and pdf_bytes[:5] == b'%PDF-':
                            with open(pdf_dir / f"{fname}.pdf", "wb") as f:
                                f.write(pdf_bytes)
                            scraper_status["total_downloaded"] += 1
                        else:
                            log_event(f"Invalid PDF for {fname} ({len(pdf_bytes)} bytes)", "error")
                    else:
                        log_event(f"No PDF data for {fname}", "error")
                except Exception as e:
                    log_event(f"Download error {jid}: {e}", "error")

        # === PAGINATION LOOP ===
        current_start = 0
        total_available = 0
        PAGE_SIZE = 1000

        while True:
            # Call the site's ajaxCall via browser context
            data = await current_session.search_judgments(
                state_code=state_code,
                from_date=from_date,
                to_date=to_date,
                keyword=request.keyword,
                start=current_start
            )

            if not data:
                log_event(f"No data returned at offset {current_start}.", "error")
                break

            # Check for error responses
            if data.get("errormsg"):
                log_event(f"Server error: {data['errormsg']}", "error")
                break

            # Extract DataTables response
            report = data.get("reportrow", data)
            if isinstance(report, dict):
                total_available = int(report.get("iTotalDisplayRecords") or report.get("iTotalRecords") or 0)
                judgments = report.get("aaData", [])
            else:
                log_event(f"Unexpected response format: {type(report)}", "error")
                break

            if not judgments:
                if current_start == 0:
                    log_event(f"No judgments found for this search.", "info")
                break

            scraper_status["total_found"] = total_available
            page_num = (current_start // PAGE_SIZE) + 1
            log_event(f"Page {page_num}: {len(judgments)} records (total: {total_available})", "net")

            # Log first row HTML on page 1 to understand structure
            if current_start == 0 and judgments:
                first_row = " ".join([str(c) for c in judgments[0]]) if isinstance(judgments[0], list) else str(judgments[0])
                log_event(f"ROW_SAMPLE: {first_row[:600]}", "scraper")

            # Parse rows and launch concurrent downloads
            tasks = []
            for i, item in enumerate(judgments):
                try:
                    # Each item is a list of HTML cells
                    row_html = " ".join([str(c) for c in item]) if isinstance(item, list) else str(item)
                    soup = BeautifulSoup(row_html, "html.parser")
                    text = soup.get_text(separator=" | ")

                    # Extract PDF path from open_pdf('idx','','court/path.pdf')
                    # The path is the 3rd argument
                    jid = None
                    m = re.search(
                        r"open_pdf\s*\(\s*'[^']*'\s*,\s*'[^']*'\s*,\s*'([^']+)'",
                        row_html
                    )
                    if m:
                        # Strip #page=... fragment
                        jid = m.group(1).split('#')[0].strip()

                    # Fallback: any court/... .pdf path
                    if not jid:
                        m = re.search(r"'(court/[^'#]+\.pdf)", row_html)
                        if m: jid = m.group(1)

                    # Extract CNR for filename
                    cnr = None
                    m_cnr = re.search(r"([A-Z]{4}\d{12,16})", text)
                    if m_cnr: cnr = m_cnr.group(1)

                    if not jid:
                        log_event(f"No PDF path found at row {current_start+i}", "error")
                        continue

                    # Build filename from CNR or offset
                    case_label = cnr if cnr else f"Record_{current_start + i}"
                    fname = re.sub(r'[^a-zA-Z0-9_-]', '_', f"{case_label}_{current_start + i}")

                    meta = {
                        "court": request.court_name,
                        "judgment_id": jid,
                        "cnr": cnr,
                        "case": case_label,
                        "from_date": from_date,
                        "to_date": to_date,
                        "text_summary": text[:500]
                    }

                    tasks.append(download_one(jid, fname, meta))
                except Exception as ex:
                    log_event(f"Row parse error at {current_start+i}: {ex}", "error")
                    continue

            # Fire downloads SEQUENTIALLY — open_pdf() uses a shared browser modal
            if tasks:
                log_event(f"Downloading {len(tasks)} judgments from page {page_num}...", "net")
                for idx, task in enumerate(tasks):
                    await task
                    if (idx + 1) % 10 == 0:
                        log_event(f"  Progress: {idx+1}/{len(tasks)} downloaded", "info")
                log_event(f"Page {page_num} complete. Total saved: {scraper_status['total_downloaded']}", "success")

            # Advance pagination by actual number of records received
            current_start += len(judgments)
            scraper_status["progress"] = min(99, int((current_start / max(total_available, 1)) * 100))

            if current_start >= total_available:
                break

            await asyncio.sleep(0.1)

        scraper_status["progress"] = 100
        log_event(f"DONE! Saved {scraper_status['total_downloaded']} of {scraper_status['total_found']} judgments.", "success")
        scraper_status["status"] = "ready"

    except Exception as e:
        log_event(f"Scraper error: {e}", "error")
        scraper_status["status"] = "error"
        scraper_status["last_error"] = str(e)

@app.post("/scrape")
async def start_scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    if not current_session or not current_session.app_token:
        raise HTTPException(status_code=400, detail="No active session. Start session first.")
    background_tasks.add_task(run_scraper, request)
    return {"message": "Scraper started"}

@app.get("/")
async def root():
    return {"name": "eCourts Judgment Scraper", "status": scraper_status["status"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
