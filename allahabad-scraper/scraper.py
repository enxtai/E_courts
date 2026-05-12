import asyncio
import aiohttp
import aiofiles
import base64
import re
import csv
import json
import argparse
import random
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
import os
from datetime import datetime, timedelta

async def solve_captcha(session):
    """Fetches the base64 encoded captcha token asynchronously."""
    ajax_url = 'https://elegalix.allahabadhighcourt.in/elegalix/getData?action=generateCaptcha'
    try:
        async with session.get(ajax_url, timeout=15) as r_ajax:
            r_ajax.raise_for_status()
            text = await r_ajax.text()
            captcha_b64 = text.strip()
            security_code = base64.b64decode(captcha_b64).decode('utf-8')
            return security_code
    except Exception as e:
        return None

def extract_judgments_from_html(html, base_url):
    """Parses the HTML and extracts judgments info with fixed regexes."""
    soup = BeautifulSoup(html, 'html.parser')
    judgments = []
    
    table = soup.find('table', {'bordercolor': '#A8E0FF'})
    if not table:
        return judgments

    rows = table.find_all('tr')
    for row in rows:
        tds = row.find_all('td')
        if len(tds) < 2:
            continue
            
        info_td = tds[1]
        if "Judgments/Orders" in info_td.text:
            continue
            
        title_tag = info_td.find('a', title="Click here to view Judgment/Order")
        if not title_tag:
            continue
            
        case_title = title_tag.text.strip()
        view_link = urljoin(base_url, title_tag['href'])
        
        # Extract metadata (Fixed parsing)
        text_content = info_td.get_text(separator=' ')
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        
        date_match = re.search(r'Date of Judgment/Order\s*-\s*(\d{1,2}/\d{1,2}/\d{4})', text_content)
        judgment_date = date_match.group(1).strip() if date_match else ''
        
        type_match = re.search(r'Judgment Type\s*-\s*(.+?)(?=\s*Coram\s*-|\s*Petitioner|\s*$)', text_content)
        judgment_type = type_match.group(1).strip() if type_match else ''
        
        coram_match = re.search(r'Coram\s*-\s*(.+?)(?=\s*Petitioner|\s*$)', text_content)
        coram = coram_match.group(1).strip() if coram_match else ''
        
        download_tag = info_td.find('a', title="This document requires Adobe Acrobat Reader for viewing")
        download_link = urljoin(base_url, download_tag['href']) if download_tag else ''
        
        # Extract judgmentID
        judgment_id = ""
        if download_link:
            parsed_url = urlparse(download_link)
            qs = parse_qs(parsed_url.query)
            if 'judgmentID' in qs:
                judgment_id = qs['judgmentID'][0]
        
        judgments.append({
            'Judgment ID': judgment_id,
            'Case Title': case_title,
            'Judgment Date': judgment_date,
            'Judgment Type': judgment_type,
            'Coram': coram,
            'View Link': view_link,
            'Download Link': download_link
        })
        
    return judgments

async def scrape_chunk(from_dt, to_dt, bench_code, max_pages):
    base_url = 'https://elegalix.allahabadhighcourt.in/elegalix/'
    start_url = urljoin(base_url, 'WebStartJudgmentDateSearch.do')
    post_url = urljoin(base_url, 'WebJudgmentDateSearch.do')
    chunk_label = f"{from_dt.strftime('%d-%m-%Y')} to {to_dt.strftime('%d-%m-%Y')}"
    print(f"Scraping chunk: {chunk_label}...")
    
    form_data = {
        'highCourtBenchCode': bench_code,
        'fromDay': str(from_dt.day),
        'fromMonth': str(from_dt.month),
        'fromYear': str(from_dt.year),
        'toDay': str(to_dt.day),
        'toMonth': str(to_dt.month),
        'toYear': str(to_dt.year),
        'submit': 'Submit'
    }

    async def make_fresh_session_and_get_page(target_page_num):
        """Start a brand new session, POST the search form, then jump to target page."""
        connector = aiohttp.TCPConnector(force_close=True)
        session = aiohttp.ClientSession(headers={'User-Agent': 'Mozilla/5.0'}, connector=connector)
        try:
            await session.get(start_url)
            security_code = await solve_captcha(session)
            if not security_code:
                return session, None, None
            
            data = {**form_data, 'securityCode': security_code}
            async with session.post(post_url, data=data) as r:
                html = await r.text()
            
            if "Invalid/Blank Security Code" in html:
                return session, None, None
            
            # If we need a specific page beyond page 1, navigate to it
            if target_page_num > 1:
                await asyncio.sleep(3) # Wait a bit before next request on fresh session
                page_url = urljoin(base_url, f'WebShowResults.do?pagenumber={target_page_num - 1}')
                async with session.get(page_url) as r:
                    html = await r.text()
                    status = r.status
                if status != 200 or "Too many requests" in html or "blocked" in html.lower():
                    return session, None, None
            
            soup = BeautifulSoup(html, 'html.parser')
            return session, html, soup
        except Exception:
            return session, None, None

    # --- Page 1: Initial search ---
    html = ""
    for attempt in range(5): # Increased to 5 attempts for initial connect under extreme load
        connector = aiohttp.TCPConnector(force_close=True)
        try:
            async with aiohttp.ClientSession(headers={'User-Agent': 'Mozilla/5.0'}, connector=connector) as session:
                await session.get(start_url)
                security_code = await solve_captcha(session)
                if not security_code:
                    print(f"  [{chunk_label}] Failed to solve captcha on attempt {attempt+1}. Retrying...")
                    await asyncio.sleep(2)
                    continue
                
                data = {**form_data, 'securityCode': security_code}
                async with session.post(post_url, data=data) as r_post:
                    html = await r_post.text()
                
                if "Invalid/Blank Security Code" in html:
                    print(f"  [{chunk_label}] Captcha verification failed on attempt {attempt+1}. Retrying...")
                    await asyncio.sleep(2)
                    continue
                
                # If we reached here, search succeeded
                break
        except Exception as e:
            err_msg = str(e)
            if "network name is no longer available" in err_msg or "Cannot connect" in err_msg:
                err_msg = "Network Connection Dropped (Firewall rate limit)"
            print(f"  [{chunk_label}] Error on attempt {attempt+1}: {err_msg}. Sleeping 5s...")
            await asyncio.sleep(5)
            
    if not html or "Invalid/Blank Security Code" in html:
        print(f"  [{chunk_label}] Failed to initialize search after 5 attempts. Stopping this chunk.")
        return []
        
    soup = BeautifulSoup(html, 'html.parser')
    total_results_tag = soup.find(string=re.compile("Total No. of Results obtained"))
    if total_results_tag:
        print(f"  [{chunk_label}] {total_results_tag.strip()}")
    else:
        print(f"  [{chunk_label}] No results found.")
        return []
    
    all_judgments = []
    judgments = extract_judgments_from_html(html, base_url)
    all_judgments.extend(judgments)
    print(f"  [{chunk_label}] Page 1: {len(judgments)} judgments")
    
    current_page_num = 1
    # One more page on the same session before we must rotate
    if max_pages > 1:
        next_tag = soup.find('a', string=re.compile("Next"))
        if next_tag:
            await asyncio.sleep(3)
            page_url = urljoin(base_url, next_tag['href'])
            try:
                async with aiohttp.ClientSession(headers={'User-Agent': 'Mozilla/5.0'}, connector=aiohttp.TCPConnector(force_close=True)) as session:
                    async with session.get(page_url) as r:
                        p2_status = r.status
                        p2_html = await r.text()
                    
                    if p2_status == 200 and "Date of Judgment/Order" in p2_html:
                        p2_judgments = extract_judgments_from_html(p2_html, base_url)
                        all_judgments.extend(p2_judgments)
                        print(f"  [{chunk_label}] Page 2: {len(p2_judgments)} judgments")
                        current_page_num = 2
                    else:
                        print(f"  [{chunk_label}] Page 2: Blocked (status {p2_status}). Will rotate session.")
            except Exception as e:
                print(f"  [{chunk_label}] Page 2 connection dropped. Will rotate session.")
        else:
            current_page_num = 1
    else:
        return all_judgments

    # --- Pages 3+: Rotate fresh sessions every 1 page to defeat per-session limits safely ---
    current_page_num_for_fetch = current_page_num + 1  # The next page we need

    while len(all_judgments) // 50 < max_pages and current_page_num_for_fetch <= max_pages:
        # Rotate: spawn a new session, POST the form, jump to the right page
        print(f"  [{chunk_label}] Rotating to fresh session for Page {current_page_num_for_fetch}...")
        fresh_session, page_html, page_soup = await make_fresh_session_and_get_page(current_page_num_for_fetch)
        await fresh_session.close()
        
        if page_html is None:
            print(f"  [{chunk_label}] Session rotation failed on page {current_page_num_for_fetch}. Sleeping 15s and retrying...")
            await asyncio.sleep(15)
            fresh_session, page_html, page_soup = await make_fresh_session_and_get_page(current_page_num_for_fetch)
            await fresh_session.close()
            if page_html is None:
                print(f"  [{chunk_label}] Retry also failed. Stopping.")
                break
        
        judgments = extract_judgments_from_html(page_html, base_url)
        if not judgments:
            print(f"  [{chunk_label}] Page {current_page_num_for_fetch}: No judgments found. Possibly end of results.")
            break
        
        all_judgments.extend(judgments)
        print(f"  [{chunk_label}] Page {current_page_num_for_fetch}: {len(judgments)} judgments")
        
        # Move to the next page
        current_page_num_for_fetch += 1
        
        # Brief pause between session rotations
        await asyncio.sleep(2)  

    return all_judgments


async def download_single_pdf(judgment, semaphore, max_retries=3):
    """Worker function to download a single PDF concurrently with a semaphore and retry logic."""
    jid = judgment.get('Judgment ID')
    if not jid:
        return {"id": "unknown", "status": "Failed", "error": "No ID"}
        
    filename = f"pdfs/{jid}.pdf"
    if os.path.exists(filename):
        # We can optionally check if file size > 0 here, but let's assume existence is success for now.
        if os.path.getsize(filename) > 0:
            return {"id": jid, "status": "Skipped (Already exists)"}

    async with semaphore:
        for attempt in range(1, max_retries + 1):
            try:
                # Use a fresh session for each PDF so that JSESSIONID cookies do not interfere concurrently.
                connector = aiohttp.TCPConnector(force_close=True)
                async with aiohttp.ClientSession(headers={'User-Agent': 'Mozilla/5.0'}, connector=connector) as session:
                    cap = await solve_captcha(session)
                    if not cap:
                        if attempt == max_retries:
                            return {"id": jid, "status": "Failed", "error": "Captcha failed repeatedly"}
                        await asyncio.sleep(2 * attempt)
                        continue
                        
                    post_url = 'https://elegalix.allahabadhighcourt.in/elegalix/WebDownloadJudgmentDocument.do'
                    data = {
                        'judgmentID': jid,
                        'subseq': 'no',
                        'securitycode': cap
                    }
                    
                    async with session.post(post_url, data=data, timeout=30) as r:
                        if r.status == 200 and 'application/pdf' in r.headers.get('Content-Type', ''):
                            content = await r.read()
                            async with aiofiles.open(filename, 'wb') as f:
                                await f.write(content)
                            return {"id": jid, "status": "Downloaded"}
                        elif r.status in [429, 403, 503]:
                            if attempt == max_retries:
                                return {"id": jid, "status": "Failed", "error": f"HTTP {r.status} after {max_retries} attempts"}
                            await asyncio.sleep(3 * attempt) # Exponential backoff for rate limiting
                            continue
                        else:
                            if attempt == max_retries:
                                return {"id": jid, "status": "Failed", "error": f"Invalid content type or status {r.status}"}
                            await asyncio.sleep(2 * attempt)
                            continue
            except Exception as e:
                if attempt == max_retries:
                    # Clean up the error message for network disconnections
                    err_str = str(e)
                    if "network name is no longer available" in err_str:
                        err_str = "Network Connection Dropped (Server aborted)"
                    return {"id": jid, "status": "Failed", "error": err_str}
                await asyncio.sleep(2 * attempt)
                continue

async def async_main(start_date_str, end_date_str, bench, max_pages, max_workers, download_pdfs, chunk_days, max_concurrent_chunks):
    start_date = datetime.strptime(start_date_str, "%d-%m-%Y")
    end_date = datetime.strptime(end_date_str, "%d-%m-%Y")
    
    if start_date > end_date:
        print("Error: Start date must be before end date.")
        return

    # Split into smaller chunks to maximize concurrency
    chunks = []
    current_start = start_date
    while current_start <= end_date:
        current_end = current_start + timedelta(days=chunk_days - 1)
        if current_end > end_date:
            current_end = end_date
        chunks.append((current_start, current_end))
        current_start = current_end + timedelta(days=1)

    print(f"Total date range split into {len(chunks)} chunks (max {chunk_days} days each).")
    
    # 1. Scrape all chunks concurrently (Limit to max_concurrent_chunks to avoid instant IP ban)
    print("\n--- Phase 1: Scraping Metadata Concurrently ---")
    chunk_semaphore = asyncio.Semaphore(max_concurrent_chunks)
    
    async def safe_scrape_chunk(f_dt, t_dt, bench, max_pages, jitter_secs):
        # Stagger startup: each chunk waits a random amount before firing
        # This prevents a "thundering herd" where all chunks hit the WAF simultaneously
        await asyncio.sleep(jitter_secs)
        async with chunk_semaphore:
            return await scrape_chunk(f_dt, t_dt, bench, max_pages)

    chunk_tasks = []
    for i, (f_dt, t_dt) in enumerate(chunks):
        # Each chunk gets a unique jitter between 0 and (index * 1.5) seconds
        # This guarantees they start in a staggered wave, not a simultaneous burst
        jitter = random.uniform(i * 1.0, i * 1.5 + 1.0)
        chunk_tasks.append(safe_scrape_chunk(f_dt, t_dt, bench, max_pages, jitter))
        
    chunk_results = await asyncio.gather(*chunk_tasks)
    
    all_data = []
    for judgments in chunk_results:
        all_data.extend(judgments)
        
    print(f"\n--- Scraping Complete ---")
    print(f"Total judgments metadata collected: {len(all_data)}")
    
    if all_data:
        os.makedirs('metadata', exist_ok=True)
        json_path = f"metadata/judgments_{start_date_str}_to_{end_date_str}.json"
        csv_path = f"metadata/judgments_{start_date_str}_to_{end_date_str}.csv"
        
        # Async write JSON
        async with aiofiles.open(json_path, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(all_data, indent=4))
        
        # Sync write CSV
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=all_data[0].keys())
            writer.writeheader()
            writer.writerows(all_data)
            
        print(f"Metadata saved to {json_path} and {csv_path}")

    # 2. Download PDFs concurrently
    if download_pdfs and all_data:
        os.makedirs('pdfs', exist_ok=True)
        print(f"\n--- Phase 2: Starting Concurrent PDF Downloads ({max_workers} workers) ---")
        
        downloadable = [j for j in all_data if j.get('Judgment ID')]
        semaphore = asyncio.Semaphore(max_workers)
        
        tasks = [download_single_pdf(j, semaphore, max_retries=3) for j in downloadable]
        
        completed = 0
        for task in asyncio.as_completed(tasks):
            result = await task
            completed += 1
            print(f"[{completed}/{len(downloadable)}] ID {result['id']}: {result['status']}")
            if 'error' in result:
                print(f"   Error: {result['error']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Allahabad High Court Judgment Scraper (Super Fast Async)")
    parser.add_argument("--from-date", default="01-05-2026", help="From date in DD-MM-YYYY format")
    parser.add_argument("--to-date", default="12-05-2026", help="To date in DD-MM-YYYY format")
    parser.add_argument("--bench", default="X", help="Bench Code (X: All, A: Allahabad, L: Lucknow)")
    parser.add_argument("--pages", type=int, default=1, help="Max number of pages to scrape PER CHUNK")
    parser.add_argument("--chunk-days", type=int, default=15, help="Number of days per chunk. Lower = more parallel workers but more server load.")
    parser.add_argument("--max-concurrent-chunks", type=int, default=6, help="Max chunks running at once. Default 6 is safe. Push to 10-15 for speed (may cause drops).")
    parser.add_argument("--max-workers", type=int, default=5, help="Number of concurrent PDF downloads.")
    parser.add_argument("--download", action="store_true", help="Download PDFs concurrently after scraping metadata")
    
    args = parser.parse_args()
    
    asyncio.run(async_main(args.from_date, args.to_date, args.bench, args.pages, args.max_workers, args.download, args.chunk_days, args.max_concurrent_chunks))
