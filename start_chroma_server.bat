@echo off
echo ============================================================
echo Starting Dedicated ChromaDB Server
echo ============================================================
echo Data Directory: d:\ETL\RAG_Chatbot\chroma_db
echo Port: 8001
echo.
c:\users\admin\.conda\envs\llmenv\Scripts\chroma.exe run --path d:\ETL\RAG_Chatbot\chroma_db --host 0.0.0.0 --port 8001
pause
