from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
import chromadb

chroma_path = r"d:\ETL\RAG_Chatbot\chroma_db"
embeddings = OllamaEmbeddings(model="nomic-embed-text", base_url="http://localhost:11434")

client = chromadb.PersistentClient(path=chroma_path)
collection = client.get_collection("rag_chatbot")

results = collection.get(include=["metadatas"])
user_ids = set()
for meta in results['metadatas']:
    if meta and 'user_id' in meta:
        user_ids.add(meta['user_id'])

print("Unique User IDs:", user_ids)

vector_store = Chroma(
    collection_name="rag_chatbot",
    embedding_function=embeddings,
    persist_directory=chroma_path,
)

for uid in user_ids:
    print(f"\nTesting retrieval for user: {uid}")
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": 4,
            "filter": {"user_id": uid}
        }
    )
    try:
        res = retriever.invoke("What is this case about?")
        print(f"Success! Retrieved {len(res)} docs.")
    except Exception as e:
        import traceback
        traceback.print_exc()

