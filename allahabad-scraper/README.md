# Allahabad High Court Judgment Scraper

A lightning-fast, asynchronous Python scraper for downloading judgment metadata and PDFs from the Allahabad High Court (eLegalix) portal. 

## 🚀 Features

- **Blazing Fast CAPTCHA Bypass:** The tool exploits a structural vulnerability in the eLegalix portal's AJAX endpoint (`/elegalix/getData?action=generateCaptcha`). Instead of relying on slow OCR (Tesseract) or audio transcription (Whisper), the script simply decodes the Base64 token natively returned by the server. **Bypass takes ~0.1s with 100% accuracy.**
- **Massive Concurrency (Micro-Chunking):** Written using `aiohttp` and `asyncio`, the scraper processes network requests in parallel. By using the `--chunk-days` argument, you can slice a massive search window into tiny parallel tasks that scrape simultaneously.
- **Anti-Rate-Limit Session Rotation:** The High Court server limits pagination (it blocks IPs/sessions that request more than 2 pages). The script defeats this by mathematically generating a **completely fresh session and CAPTCHA** for every single page turn, preventing 429/403 blocks.
- **Concurrent PDF Downloading:** Utilizing async semaphores, the script downloads multiple PDF files simultaneously, radically speeding up data acquisition while respecting server limits.
- **Rich Metadata Extraction:** Exports highly structured JSON and CSV files containing `Case Title`, `Judgment Date`, `Judgment Type`, `Coram`, `View Link`, and the direct `Download Link`.

---

## 🛠️ Requirements

The scraper relies on standard Python and a few lightweight networking/parsing libraries.

```bash
pip install aiohttp aiofiles beautifulsoup4 requests
```

*(Note: If you are using a standard Anaconda distribution or common data science environment, most of these are likely already installed).*

---

## 📖 How to Use

Run the scraper from your terminal using `scraper.py`. 

### Basic Example (Scrape Metadata Only)
This fetches the first page of results (up to 50 judgments) for the specified date range and saves the JSON/CSV into the `metadata/` folder.
```bash
python scraper.py --from-date 01-01-2026 --to-date 31-01-2026
```

### Advanced Example (Full Extraction + PDF Download)
This fetches **all pages** (up to 1000 pages per chunk) across an entire year, extracts the metadata, and then concurrently downloads all the associated PDFs into the `pdfs/` folder. It uses a smaller chunk size of `15` days to boost metadata scraping speed.
```bash
python scraper.py --from-date 01-01-2025 --to-date 31-12-2025 --pages 1000 --chunk-days 15 --download --max-workers 5
```

---

## ⚙️ Command Line Arguments

| Argument | Default | Description |
| :--- | :--- | :--- |
| `--from-date` | `01-05-2026` | Start date in `DD-MM-YYYY` format. |
| `--to-date` | `12-05-2026` | End date in `DD-MM-YYYY` format. |
| `--bench` | `X` | Bench Code (`X` = All, `A` = Allahabad, `L` = Lucknow). |
| `--pages` | `1` | Max number of pagination pages to scrape **per chunk** (50 results per page). Set to a high number like `1000` to get all results. |
| `--chunk-days` | `15` | Slices the date range into blocks of `N` days that are scraped concurrently. Default is `15`. |
| `--download` | `False` | Add this flag to automatically download the Judgment PDFs after scraping the metadata. |
| `--max-workers` | `5` | The number of concurrent asynchronous connections to use when downloading PDFs. Keep this between 5-10 to avoid server rate limits. |

---

## 🧠 How it Works Under the Hood

### 1. The Captcha Exploit
When standard users access the site, a visual image and an audio tag are populated with a 6-digit code. However, the javascript triggers an AJAX `GET` request to `/getData?action=generateCaptcha`. The server responds with a Base64 encoded string (e.g., `MzMzODM5`). When decoded, this yields the exact 6-digit text (`333839`). The script does this dynamically per session without rendering the frontend.

### 2. Phase 1: Metadata Chunking
If you request data from `01-01-2020` to `31-12-2025`, the script mathematically divides this timeline into micro-blocks based on the `--chunk-days` setting. It limits concurrent execution of these blocks to 10 at a time.
Crucially, the server restricts pagination to 2 pages per session. To bypass this, the script sequentially reads a page, kills the session, creates a brand new `aiohttp.ClientSession()`, solves a new CAPTCHA, posts the search form again, and jumps directly to the next page number. This "Session Rotation" completely evades the server's per-session firewall block.

### 3. Phase 2: PDF Grabbing
PDF downloading requires an independent CAPTCHA validation per request. For every judgment ID gathered in Phase 1, an asynchronous worker spins up. It hits the CAPTCHA endpoint, decodes the token, and sends a `POST` request to `WebDownloadJudgmentDocument.do` along with the token and `judgmentID`. The binary stream is then saved directly to disk. The `asyncio.Semaphore` limits this to `--max-workers` to ensure the High Court's server doesn't outright block the IP for DDoS-like behavior.
