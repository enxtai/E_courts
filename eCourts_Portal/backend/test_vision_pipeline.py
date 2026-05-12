import os
import fitz  # PyMuPDF
import sqlite3
import base64
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
    return base64_images

def main():
    pdf_path = r"D:\ETL\Spider\Spider\I - Kannon\output\pdfs\supremecourt\1950\1041073_A_M__Mair___Co_vs_Gordhandass_Sagarmull_on_30_November__1950.pdf"
    
    print(f"Loading PDF: {pdf_path}")
    base64_images = pdf_to_base64_images(pdf_path)
    print(f"Rendered {len(base64_images)} pages to images.")
    
    # Construct LangChain message
    content = [{"type": "text", "text": "Extract the structured case metadata from the following pages of a legal document."}]
    for b64 in base64_images:
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })
        
    msg = HumanMessage(content=content)
    
    print("Calling LLM (gemma-4-31b-it) via LangChain...")
    try:
        model_name = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
        llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1)
        structured_llm = llm.with_structured_output(CaseMetadata)
        
        res = structured_llm.invoke([msg])
        
        print("\n--- LLM Extraction Success ---")
        print(f"Title: {res.title}")
        print(f"Judges: {res.judges}")
        print(f"Lawyers: {res.lawyers}")
        print(f"Court: {res.court}")
        
        # Save to DB
        conn = get_db()
        c = conn.cursor()
        
        # Check if exists
        c.execute("SELECT id FROM cases WHERE file_path = ?", (pdf_path,))
        row = c.fetchone()
        
        if row:
            print(f"\nUpdating existing case in DB (Row ID: {row['id']})")
            c.execute("""
                UPDATE cases 
                SET title=?, court=?, year=?, judges=?, lawyers=?, litigant_petitioner=?, litigant_respondent=?, extracted_text=?
                WHERE file_path=?
            """, (res.title, res.court, res.year, res.judges, res.lawyers, res.litigant_petitioner, res.litigant_respondent, res.extracted_text, pdf_path))
        else:
            print("\nInserting new case into DB")
            c.execute("""
                INSERT INTO cases (file_path, court, year, title, litigant_petitioner, litigant_respondent, judges, lawyers, extracted_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (pdf_path, res.court, res.year, res.title, res.litigant_petitioner, res.litigant_respondent, res.judges, res.lawyers, res.extracted_text))
            
        conn.commit()
        conn.close()
        print("Database operation complete.")
        
    except Exception as e:
        print(f"Error during extraction: {e}")

if __name__ == "__main__":
    main()
