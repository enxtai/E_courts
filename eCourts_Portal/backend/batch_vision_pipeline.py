import os
import fitz  # PyMuPDF
import sqlite3
import base64
import time
import glob
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv(r"D:\ETL\RAG_Chatbot\.env")

class CaseMetadata(BaseModel):
    title: str = Field(description="The formal title of the case")
    court: str = Field(description="The specific Court")
    year: str = Field(description="The year of the case")
    judges: str = Field(description="Comma-separated list of judge names")
    lawyers: str = Field(description="Comma-separated list of all lawyers")
    litigant_petitioner: str = Field(description="Petitioner name")
    litigant_respondent: str = Field(description="Respondent name")
    extracted_text: str = Field(description="A brief summary of the facts and the final outcome.")

def get_db():
    conn = sqlite3.connect("courtdb.sqlite")
    conn.row_factory = sqlite3.Row
    return conn

def pdf_to_base64_images(pdf_path):
    doc = fitz.open(pdf_path)
    base64_images = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
        img_bytes = pix.tobytes("jpeg")
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        base64_images.append(b64)
    doc.close()
    return base64_images

def main():
    target_dir = r"D:\ETL\Spider\Spider\I - Kannon\output\pdfs\supremecourt\1950"
    pdf_files = glob.glob(os.path.join(target_dir, "*.pdf"))
    
    print(f"Found {len(pdf_files)} PDF files in directory.")
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT file_path FROM cases")
    processed_files = set(row['file_path'] for row in c.fetchall())
    
    model_name = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1)
    structured_llm = llm.with_structured_output(CaseMetadata)
    
    success_count = 0
    limit = 10
    
    for pdf_path in pdf_files:
        if success_count >= limit:
            print(f"\nReached batch limit of {limit}. Stopping.")
            break
            
        if pdf_path in processed_files:
            print(f"Skipping already processed: {os.path.basename(pdf_path)}")
            continue
            
        print(f"\n[{success_count+1}/{limit}] Processing: {os.path.basename(pdf_path)}")
        try:
            base64_images = pdf_to_base64_images(pdf_path)
            
            content = [{"type": "text", "text": "Extract the structured case metadata from the following pages of a legal document."}]
            for b64 in base64_images:
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                })
                
            msg = HumanMessage(content=content)
            
            res = structured_llm.invoke([msg])
            
            print(f"  Title: {res.title}")
            print(f"  Judges: {res.judges}")
            
            c.execute("""
                INSERT INTO cases (file_path, court, year, title, litigant_petitioner, litigant_respondent, judges, lawyers, extracted_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (pdf_path, res.court, res.year, res.title, res.litigant_petitioner, res.litigant_respondent, res.judges, res.lawyers, res.extracted_text))
            
            conn.commit()
            processed_files.add(pdf_path)
            success_count += 1
            
            if success_count < limit:
                print("  Waiting 3 seconds...")
                time.sleep(3)
                
        except Exception as e:
            print(f"  Error processing {os.path.basename(pdf_path)}: {e}")
            
    conn.close()
    print(f"\nBatch complete. Successfully processed {success_count} new cases.")

if __name__ == "__main__":
    main()
