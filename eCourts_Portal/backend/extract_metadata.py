import os
import sys
import glob
import re
import sqlite3
from pypdf import PdfReader

# Database Configuration
DB_PATH = "courtdb.sqlite"
PDF_DIR = r"D:\ETL\Spider\Spider\I - Kannon\output\pdfs"

def setup_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT UNIQUE,
            court TEXT,
            year TEXT,
            title TEXT,
            litigant_petitioner TEXT,
            litigant_respondent TEXT,
            judges TEXT,
            lawyers TEXT,
            extracted_text TEXT
        )
    ''')
    conn.commit()
    return conn

def safe_extract(pattern, text, default=""):
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1).strip() if match else default

def extract_metadata_from_text(text):
    """
    Very basic heuristics for historical/Kanoon PDFs.
    Depending on the exact format of the courts, these regexes catch common structures.
    """
    title_match = re.search(r'([^\n]+)\s+vs\.?\s+([^\n]+)\s+on', text, re.IGNORECASE)
    title_val = title_match.group(0).strip() if title_match else ""
    petitioner_val = title_match.group(1).strip() if title_match else ""
    respondent_val = title_match.group(2).strip() if title_match else ""

    # Safer judges match: only alphabetical characters, commas, spaces directly after JUDGMENT or ORDER
    judge_match = re.search(r'(?:JUDGMENT|ORDER)\s*\n+([A-Za-z\s\.,]{2,60})\n', text)
    judges_val = judge_match.group(1).strip() if judge_match else ""
    if "petition" in judges_val.lower() or "appeal" in judges_val.lower() or judges_val.startswith(('This', 'The', 'In ')):
        judges_val = ""

    # Look for lawyers using honorifics in the first 2500 chars
    lawyer_matches = re.findall(r'(?:Shri|Mr\.|Ms\.|Advocate|Learned counsel)\s+([A-Z][A-Za-z\s\.\']{2,30})(?:,|\s+for|\s+appear)', text[:2500])
    valid_lawyers = list(set([l.strip() for l in lawyer_matches if len(l.strip()) > 3 and " " in l.strip() and "Court" not in l and "Judge" not in l]))
    lawyers_val = ", ".join(valid_lawyers[:3])

    metadata = {
        "title": title_val,
        "petitioner": petitioner_val,
        "respondent": respondent_val,
        "judges": judges_val,
        "lawyers": lawyers_val
    }
    
    # If title extraction fails, use the first non-empty line
    lines = [L.strip() for L in text.split('\n') if L.strip()]
    if not metadata["title"] and lines:
        metadata["title"] = lines[0]
        
    return metadata

def process_pdfs(conn):
    pdf_files = glob.glob(os.path.join(PDF_DIR, "**", "*.pdf"), recursive=True)
    print(f"Found {len(pdf_files)} PDFs in {PDF_DIR}. Extracting metadata...")
    
    c = conn.cursor()
    count = 0
    
    for file_path in pdf_files:
        # Avoid duplicates
        c.execute("SELECT 1 FROM cases WHERE file_path=?", (file_path,))
        if c.fetchone():
            continue
            
        try:
            reader = PdfReader(file_path)
            text = ""
            # We only need the first page for metadata generally
            if len(reader.pages) > 0:
                text = reader.pages[0].extract_text()
                
            if not text.strip():
                continue
                
            # Extract Court and Year from directory structure
            # e.g., .../pdfs/bombay/1868/file.pdf
            parts = os.path.normpath(file_path).split(os.sep)
            court, year = "Unknown", "Unknown"
            try:
                idx = parts.index("pdfs")
                if idx + 1 < len(parts): court = parts[idx + 1]
                if idx + 2 < len(parts): year = parts[idx + 2]
            except ValueError:
                pass
                
            meta = extract_metadata_from_text(text)
            
            c.execute('''
                INSERT INTO cases (file_path, court, year, title, litigant_petitioner, litigant_respondent, judges, lawyers, extracted_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                file_path, 
                court, 
                year, 
                meta["title"], 
                meta["petitioner"], 
                meta["respondent"], 
                meta["judges"], 
                meta["lawyers"], 
                text[:1000] # Store preview
            ))
            count += 1
            if count % 50 == 0:
                print(f"Extracted {count} files...")
                conn.commit()
                
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
    conn.commit()
    print(f"✅ Total newly extracted cases: {count}")

if __name__ == "__main__":
    conn = setup_db()
    process_pdfs(conn)
    conn.close()
