from fastapi import FastAPI, Query, File, UploadFile
from fastapi.responses import StreamingResponse
import json
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sqlite3
from typing import List, Optional
import os
import sys
import asyncio
import shutil
import subprocess
import time
import fitz
import base64
from dotenv import load_dotenv
import chromadb

# Load env from local backend directory
load_dotenv()

try:
    from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
    from langchain_core.messages import HumanMessage, AIMessage
    from langchain_core.output_parsers import StrOutputParser
    from langchain_ollama import OllamaEmbeddings
    from langchain_chroma import Chroma
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    pass

class CaseOutcome(BaseModel):
    case_status: str = Field(description="The final status of the case: 'Allowed', 'Dismissed', 'Disposed', 'Remanded', or 'Unknown'")
    lawyer_side: str = Field(description="The side the requested lawyer represented: 'Petitioner', 'Respondent', or 'Unknown'")
    outcome: str = Field(description="The outcome for the requested lawyer: 'Win' (Petitioner+Allowed, Respondent+Dismissed), 'Loss' (Petitioner+Dismissed, Respondent+Allowed), or 'Neutral'")

class CaseMetadata(BaseModel):
    title: str = Field(description="The formal title of the case")
    court: str = Field(description="The specific Court")
    year: str = Field(description="The year of the case")
    judges: str = Field(description="Comma-separated list of judge names")
    lawyers: str = Field(description="Comma-separated list of all lawyers")
    litigant_petitioner: str = Field(description="Petitioner name")
    litigant_respondent: str = Field(description="Respondent name")
    extracted_text: str = Field(description="A brief summary of the facts and the final outcome.")

def pdf_to_base64_images(pdf_path):
    doc = fitz.open(pdf_path)
    base64_images = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2))
        img_bytes = pix.tobytes("jpeg")
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        base64_images.append(b64)
    doc.close()
    return base64_images

app = FastAPI(title="eCourts Portal API")

# Allow NextJS frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "courtdb.sqlite"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/lawyers")
def search_lawyers(query: str = Query(default="", min_length=0)):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE (lawyers LIKE ? OR title LIKE ?) AND NULLIF(TRIM(lawyers), '') IS NOT NULL
        LIMIT 50
    """, (f"%{query}%", f"%{query}%"))
    results = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"results": results}

@app.get("/api/litigants")
def search_litigants(query: str = Query(default="", min_length=0)):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE (litigant_petitioner LIKE ? OR litigant_respondent LIKE ? OR title LIKE ?)
        AND NULLIF(TRIM(litigant_petitioner), '') IS NOT NULL
        LIMIT 50
    """, (f"%{query}%", f"%{query}%", f"%{query}%"))
    results = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"results": results}

@app.get("/api/judges")
def search_judges(query: str = Query(default="", min_length=0)):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE judges LIKE ? AND NULLIF(TRIM(judges), '') IS NOT NULL
        LIMIT 50
    """, (f"%{query}%",))
    results = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"results": results}

@app.get("/api/orders")
def search_orders(query: str = Query(default="", min_length=0), court: Optional[str] = None):
    conn = get_db()
    c = conn.cursor()
    
    sql = "SELECT rowid as id, * FROM cases WHERE title LIKE ?"
    params = [f"%{query}%"]
    
    if court:
        sql += " AND court=?"
        params.append(court)
        
    sql += " LIMIT 50"
    
    c.execute(sql, tuple(params))
    results = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"results": results}
    
@app.get("/api/lawyer/{name}")
def get_lawyer_profile(name: str):
    conn = get_db()
    c = conn.cursor()
    # Find all cases associated with this lawyer
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE lawyers LIKE ?
        ORDER BY year DESC
    """, (f"%{name}%",))
    cases = [dict(row) for row in c.fetchall()]
    conn.close()
    
    if not cases:
        return {"error": "Lawyer not found", "cases": []}
        
    courts = list(set(c["court"] for c in cases if c["court"] and c["court"] != "Unknown"))
    years = sorted(list(set(c["year"] for c in cases if c["year"] and c["year"] != "Unknown")))
    
    profile = {
        "name": name,
        "total_cases": len(cases),
        "courts": courts,
        "years_active": f"{min(years)} - {max(years)}" if years else "Unknown"
    }
    
    return {
        "profile": profile,
        "cases": cases
    }
    
@app.get("/api/litigant/{name}")
def get_litigant_profile(name: str):
    conn = get_db()
    c = conn.cursor()
    # Find all cases associated with this litigant (either petitioner or respondent)
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE litigant_petitioner LIKE ? OR litigant_respondent LIKE ?
        ORDER BY year DESC
    """, (f"%{name}%", f"%{name}%"))
    cases = [dict(row) for row in c.fetchall()]
    conn.close()
    
    if not cases:
        return {"error": "Litigant not found", "cases": []}
        
    courts = list(set(c["court"] for c in cases if c["court"] and c["court"] != "Unknown"))
    years = sorted(list(set(c["year"] for c in cases if c["year"] and c["year"] != "Unknown")))
    
    profile = {
        "name": name,
        "total_cases": len(cases),
        "courts": courts,
        "years_active": f"{min(years)} - {max(years)}" if years else "Unknown"
    }
    
    return {
        "profile": profile,
        "cases": cases
    }
    
@app.get("/api/judge/{name}")
def get_judge_profile(name: str):
    conn = get_db()
    c = conn.cursor()
    # Find all cases associated with this judge
    c.execute("""
        SELECT rowid as id, * FROM cases 
        WHERE judges LIKE ?
        ORDER BY year DESC
    """, (f"%{name}%",))
    cases = [dict(row) for row in c.fetchall()]
    conn.close()
    
    if not cases:
        return {"error": "Judge not found", "cases": []}
        
    courts = list(set(c["court"] for c in cases if c["court"] and c["court"] != "Unknown"))
    years = sorted(list(set(c["year"] for c in cases if c["year"] and c["year"] != "Unknown")))
    
    profile = {
        "name": name,
        "total_cases": len(cases),
        "courts": courts,
        "years_active": f"{min(years)} - {max(years)}" if years else "Unknown"
    }
    
    return {
        "profile": profile,
        "cases": cases
    }
    
@app.get("/api/case/{case_id}")
def get_case(case_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT rowid as id, * FROM cases WHERE rowid = ?", (case_id,))
    row = c.fetchone()
    conn.close()
    
    if not row:
        return {"error": "Case not found"}
        
    return dict(row)
    
@app.get("/api/stats")
def get_stats():
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) as total FROM cases")
    total_cases = c.fetchone()["total"]
    
    c.execute("SELECT court, COUNT(*) as count FROM cases GROUP BY court ORDER BY count DESC")
    courts = [dict(row) for row in c.fetchall()]
    
    conn.close()
    return {
        "total_cases": total_cases,
        "courts_breakdown": courts
    }

@app.get("/api/analytics/win-ratio")
async def get_win_ratio(lawyer: str, judge: str, limit: int = 5):
    conn = get_db()
    c = conn.cursor()
    # Fetch cases involving both lawyer and judge
    if judge == "ALL":
        c.execute("""
            SELECT rowid as id, extracted_text, title, year 
            FROM cases 
            WHERE lawyers LIKE ?
            LIMIT ?
        """, (f"%{lawyer}%", limit))
    else:
        c.execute("""
            SELECT rowid as id, extracted_text, title, year 
            FROM cases 
            WHERE lawyers LIKE ? AND judges LIKE ?
            LIMIT ?
        """, (f"%{lawyer}%", f"%{judge}%", limit))
    cases = [dict(row) for row in c.fetchall()]
    conn.close()
    
    if not cases:
        return {"error": "No cases found for this combination.", "total_analyzed": 0}
        
    try:
        # Initialize Gemini via LangChain
        model_name = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
        llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1)
        structured_llm = llm.with_structured_output(CaseOutcome)
    except Exception as e:
        return {"error": f"LLM initialization failed. Please check dependencies and GOOGLE_API_KEY. {str(e)}", "total_analyzed": 0}
        
    wins, losses, neutrals = 0, 0, 0
    
    async def analyze_case(case):
        text = case.get("extracted_text", "")
        
        if not text:
            return {"case_id": case["id"], "title": case["title"], "outcome": "Unknown"}
            
        prompt = f"""Analyze the following judgement excerpt and determine the outcome for the lawyer '{lawyer}'.
        
Excerpt:
{text}
"""
        try:
            res = await structured_llm.ainvoke(prompt)
            return {
                "case_id": case["id"],
                "title": case["title"],
                "year": case["year"],
                "case_status": res.case_status,
                "lawyer_side": res.lawyer_side,
                "outcome": res.outcome
            }
        except Exception as e:
            return {"case_id": case["id"], "title": case["title"], "error": str(e), "outcome": "Error"}

    # Process sequentially or concurrently. Doing concurrently for fast on-the-fly feedback.
    tasks = [analyze_case(case) for case in cases]
    analyzed_cases = await asyncio.gather(*tasks)
    
    for ac in analyzed_cases:
        o = ac.get("outcome", "")
        if o == "Win": wins += 1
        elif o == "Loss": losses += 1
        else: neutrals += 1
        
    total_analyzed = len(analyzed_cases)
    win_ratio = round((wins / total_analyzed) * 100, 1) if total_analyzed > 0 else 0
    
    return {
        "lawyer": lawyer,
        "judge": judge,
        "total_analyzed": total_analyzed,
        "wins": wins,
        "losses": losses,
        "neutrals": neutrals,
        "win_ratio_percentage": win_ratio,
        "details": analyzed_cases
    }

@app.post("/api/admin/vision-ingest")
async def vision_ingest(files: List[UploadFile] = File(...)):
    upload_dir = os.path.join(os.getcwd(), "uploads", str(int(time.time())))
    os.makedirs(upload_dir, exist_ok=True)
    
    async def generate_logs():
        yield "data: [SYSTEM] Starting Vision Extraction Pipeline for Batch...\n\n"
        await asyncio.sleep(0.5)
        
        try:
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT file_path FROM cases")
            processed_files = set(os.path.basename(row['file_path']) for row in c.fetchall())
            conn.close()
            
            results = []
            for idx, file in enumerate(files):
                if file.filename in processed_files:
                    yield f"data: [CHECKPOINT] Skipping {file.filename} (already in courtdb).\n\n"
                    continue
                    
                file_path = os.path.join(upload_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                yield f"data: [FILE] Saved {file.filename} ({idx+1}/{len(files)}).\n\n"
                
                try:
                    yield f"data: [PyMuPDF] Slicing {file.filename} into high-res images...\n\n"
                    base64_images = await asyncio.to_thread(pdf_to_base64_images, file_path)
                    
                    batch_size = 10
                    merged_res = {
                        "title": "", "court": "", "year": "", "judges": "", "lawyers": "", 
                        "litigant_petitioner": "", "litigant_respondent": "", "extracted_text": ""
                    }
                    
                    import math
                    total_batches = math.ceil(len(base64_images) / batch_size)
                    
                    for i in range(0, len(base64_images), batch_size):
                        chunk = base64_images[i:i+batch_size]
                        batch_num = (i // batch_size) + 1
                        yield f"data: [GEMINI] Transmitting pages {i+1} to {min(i+batch_size, len(base64_images))} (Batch {batch_num}/{total_batches}) for OCR inference...\n\n"
                        
                        content = [{"type": "text", "text": "Extract the structured case metadata from the following pages of a legal document."}]
                        for b64 in chunk:
                            content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
                            
                        from langchain_core.messages import HumanMessage
                        msg = HumanMessage(content=content)
                        
                        model_name = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
                        llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.1)
                        structured_llm = llm.with_structured_output(CaseMetadata)
                        
                        max_retries = 5
                        for attempt in range(max_retries):
                            try:
                                res = await asyncio.to_thread(structured_llm.invoke, [msg])
                                break # Success, exit loop
                            except Exception as e:
                                if attempt < max_retries - 1:
                                    wait_time = (2 ** attempt) * 5 # 5, 10, 20, 40, 80 seconds
                                    yield f"data: [RETRY] Attempt {attempt+1} failed: {e}. Retrying in {wait_time}s...\n\n"
                                    await asyncio.sleep(wait_time)
                                else:
                                    raise e # Max retries reached, raise the exception
                        
                        if res.title and not merged_res["title"]: merged_res["title"] = res.title
                        if res.court and not merged_res["court"]: merged_res["court"] = res.court
                        if res.year and not merged_res["year"]: merged_res["year"] = res.year
                        if res.judges and not merged_res["judges"]: merged_res["judges"] = res.judges
                        if res.lawyers and not merged_res["lawyers"]: merged_res["lawyers"] = res.lawyers
                        if res.litigant_petitioner and not merged_res["litigant_petitioner"]: merged_res["litigant_petitioner"] = res.litigant_petitioner
                        if res.litigant_respondent and not merged_res["litigant_respondent"]: merged_res["litigant_respondent"] = res.litigant_respondent
                        
                        if res.extracted_text:
                            if total_batches > 1:
                                merged_res["extracted_text"] += f"[Part {batch_num}]: {res.extracted_text}\n"
                            else:
                                merged_res["extracted_text"] = res.extracted_text
                                
                    yield f"data: [GEMINI] Inference complete across {total_batches} batches.\n\n"
                    
                    yield f"data: [SQLITE] Inserting extracted metadata for {file.filename}...\n\n"
                    conn = get_db()
                    c = conn.cursor()
                    c.execute("""
                        INSERT INTO cases (file_path, court, year, title, litigant_petitioner, litigant_respondent, judges, lawyers, extracted_text)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (file_path, merged_res["court"], merged_res["year"], merged_res["title"], 
                          merged_res["litigant_petitioner"], merged_res["litigant_respondent"], 
                          merged_res["judges"], merged_res["lawyers"], merged_res["extracted_text"]))
                    conn.commit()
                    conn.close()
                    
                    results.append(merged_res)
                except Exception as file_error:
                    yield f"data: [ERROR] Failed to process {file.filename}: {str(file_error)}\n\n"
                    continue
            
            yield "data: [SYSTEM] Batch Processing Complete.\n\n"
            
            payload = {
                "success": True,
                "data": results
            }
            yield f"data: [RESULT] {json.dumps(payload)}\n\n"
            
        except Exception as e:
            yield f"data: [ERROR] Pipeline failed: {str(e)}\n\n"
            
    return StreamingResponse(generate_logs(), media_type="text/event-stream")

from fastapi import Form

@app.post("/api/admin/rag-ingest")
async def rag_ingest(
    files: List[UploadFile] = File(...),
    user_id: str = Form(...)
):
    upload_dir = os.path.join(os.getcwd(), "rag_uploads", user_id, str(int(time.time())))
    os.makedirs(upload_dir, exist_ok=True)
    
    async def generate_logs():
        yield "data: [SYSTEM] Starting RAG Ingestion Pipeline for Batch...\n\n"
        await asyncio.sleep(0.5)
        
        try:
            users_dir = os.path.join(os.getcwd(), "users")
            os.makedirs(users_dir, exist_ok=True)
            rag_checkpoint_path = os.path.join(users_dir, f"rag_processed_{user_id}.json")
            if os.path.exists(rag_checkpoint_path):
                with open(rag_checkpoint_path, "r") as f:
                    rag_processed = set(json.load(f))
            else:
                rag_processed = set()
                
            files_to_process = []
            for idx, file in enumerate(files):
                if file.filename in rag_processed:
                    yield f"data: [CHECKPOINT] Skipping {file.filename} (already embedded in RAG).\n\n"
                    continue
                    
                file_path = os.path.join(upload_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                yield f"data: [FILE] Saved {file.filename} to RAG directory ({idx+1}/{len(files)}).\n\n"
                files_to_process.append(file.filename)
                
            if not files_to_process:
                yield "data: [SYSTEM] All files skipped. Batch Processing Complete.\n\n"
                yield f"data: [RESULT] {json.dumps({'success': True, 'message': 'All skipped'})}\n\n"
                return
                
            yield "data: [PROCESS] Spawning ingest.py subprocess...\n\n"
            python_exe = sys.executable
            ingest_script = os.path.join(os.path.dirname(os.getcwd()), "RAG_Chatbot", "ingest.py")
            cwd_path = os.path.join(os.path.dirname(os.getcwd()), "RAG_Chatbot")
            
            import subprocess
            process = subprocess.Popen(
                [python_exe, ingest_script, "--data-dir", upload_dir, "--user-id", user_id],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='replace',
                cwd=cwd_path
            )
            
            while True:
                line = await asyncio.to_thread(process.stdout.readline)
                if not line:
                    break
                decoded_line = line.strip()
                if decoded_line:
                    yield f"data: [OLLAMA] {decoded_line}\n\n"
            
            await asyncio.to_thread(process.wait)
            yield f"data: [PROCESS] RAG Batch Ingestion complete. Exit code {process.returncode}.\n\n"
            
            if process.returncode == 0:
                rag_processed.update(files_to_process)
                with open(rag_checkpoint_path, "w") as f:
                    json.dump(list(rag_processed), f)
            
            payload = {"success": process.returncode == 0}
            yield f"data: [RESULT] {json.dumps(payload)}\n\n"
            
        except Exception as e:
            import traceback
            err_msg = traceback.format_exc()
            yield f"data: [ERROR] Subprocess failed: {str(e)}\n{err_msg}\n\n"
            
    return StreamingResponse(generate_logs(), media_type="text/event-stream")

@app.get("/api/documents")
def get_documents():
    conn = get_db()
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT id, title, court, year, judges, lawyers, litigant_petitioner, litigant_respondent, extracted_text FROM cases ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    
    docs = [dict(row) for row in rows]
    return {"success": True, "data": docs}

@app.get("/api/vault-documents/{user_id}")
def get_vault_documents(user_id: str):
    rag_checkpoint_path = os.path.join(os.getcwd(), "users", f"rag_processed_{user_id}.json")
    if os.path.exists(rag_checkpoint_path):
        with open(rag_checkpoint_path, "r") as f:
            files = json.load(f)
    else:
        files = []
    
    docs = [{"id": i, "title": f, "status": "Embedded in Vector Store"} for i, f in enumerate(files)]
    return {"success": True, "data": docs}

class ChatRequest(BaseModel):
    message: str
    user_id: str
    history: list = []

def get_vector_store():
    client = chromadb.HttpClient(host="localhost", port=8001)
    
    embeddings = OllamaEmbeddings(
        model="nomic-embed-text",
        base_url="http://localhost:11434",
    )
    
    vector_store = Chroma(
        client=client,
        collection_name="rag_chatbot",
        embedding_function=embeddings,
    )
    return vector_store

def init_rag_chain(user_id: str):
    store = get_vector_store()
    
    retriever = store.as_retriever(
        search_type="similarity", 
        search_kwargs={
            "k": 4,
            "filter": {"user_id": user_id}
        }
    )
    
    model_name = os.getenv("GEMINI_MODEL", "gemma-4-31b-it")
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.3)
    
    # Chain to condense the question based on chat history
    condense_prompt = ChatPromptTemplate.from_messages([
        ("system", "Given a chat history and the latest user question which might reference context in the chat history, formulate a standalone question which can be understood without the chat history. Do NOT answer the question, just reformulate it if needed and otherwise return it as is."),
        MessagesPlaceholder("chat_history"),
        ("human", "{question}"),
    ])
    condense_chain = condense_prompt | llm | StrOutputParser()

    RAG_SYSTEM_PROMPT = """\
586: You are a helpful, knowledgeable legal assistant. Answer the user's question based ONLY on the provided context retrieved from the knowledge base. If the context does not contain enough information to answer the question, say so honestly. Be concise but thorough.
587: 
588: ───── Retrieved Context ─────
589: {context}
590: ─────────────────────────────
591: """
    prompt = ChatPromptTemplate.from_messages([
        ("system", RAG_SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{question}"),
    ])
    
    def format_docs(docs):
        formatted = []
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown")
            formatted.append(f"[Source {i}: {source}]\n{doc.page_content}")
        return "\n\n".join(formatted)
        
    chain = (
        {
            "context": lambda x: format_docs(retriever.invoke(condense_chain.invoke({"chat_history": x["chat_history"], "question": x["question"]}))),
            "chat_history": lambda x: x["chat_history"],
            "question": lambda x: x["question"],
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    
    return chain

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        # Prevent ChromaDB 'Error finding id' crash by ensuring user actually has documents
        rag_checkpoint_path = os.path.join(os.getcwd(), "users", f"rag_processed_{req.user_id}.json")
        if not os.path.exists(rag_checkpoint_path):
            return {"success": True, "response": "You haven't uploaded any documents yet! Please upload a PDF in your Document Vault before chatting."}
            
        with open(rag_checkpoint_path, "r") as f:
            user_docs = json.load(f)
            if not user_docs:
                return {"success": True, "response": "You haven't uploaded any documents yet! Please upload a PDF in your Document Vault before chatting."}

        chain = await asyncio.to_thread(init_rag_chain, req.user_id)
        
        chat_history = []
        for msg in req.history:
            if msg["role"] == "user":
                chat_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                chat_history.append(AIMessage(content=msg["content"]))
                
        response = await asyncio.to_thread(chain.invoke, {
            "question": req.message,
            "chat_history": chat_history,
        })
        
        return {"success": True, "response": response}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


