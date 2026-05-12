from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
import os

chroma_path = r"d:\ETL\RAG_Chatbot\chroma_db"
embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434",
)

vector_store = Chroma(
    collection_name="rag_chatbot",
    embedding_function=embeddings,
    persist_directory=chroma_path,
)

print(f"Total documents: {vector_store._collection.count()}")

res = vector_store._collection.get(
    where={"user_id": "S6T2pJzPpHZHOTA3UArP2z5nuMv1"}
)
print(f"Documents for S6T2pJzPpHZHOTA3UArP2z5nuMv1: {len(res['documents'])}")
if len(res['documents']) > 0:
    print(f"Sample Metadata: {res['metadatas'][0]}")

res_any = vector_store._collection.get(limit=1)
print(f"Sample Any Metadata: {res_any['metadatas'][0]}")

