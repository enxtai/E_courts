"""
chatbot.py — RAG Chatbot with Conversational Memory
=====================================================
Connects to the persisted ChromaDB vector store, retrieves relevant
context via similarity search, and generates answers using Google
Gemini via LangChain's LCEL pipeline. Supports multi-turn conversation.

Usage:
    python chatbot.py
"""

import os
import sys
from dotenv import load_dotenv

from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
import chromadb
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ─── Configuration ────────────────────────────────────────────────────────────

load_dotenv()

CHROMA_HOST = "localhost"
CHROMA_PORT = 8001
COLLECTION_NAME = "rag_chatbot"
EMBEDDING_MODEL = "nomic-embed-text"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = "gemma-4-31b-it"

# ─── RAG Prompt Template ─────────────────────────────────────────────────────

RAG_SYSTEM_PROMPT = """\
You are a helpful, knowledgeable assistant. Answer the user's question based \
ONLY on the provided context retrieved from the knowledge base. If the context \
does not contain enough information to answer the question, say so honestly — \
do not make up information.

Be concise but thorough. If relevant, cite which part of the context supports \
your answer.

───── Retrieved Context ─────
{context}
─────────────────────────────
"""

# ─── Helper Functions ─────────────────────────────────────────────────────────


def format_docs(docs) -> str:
    """Format retrieved documents into a readable context string."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        formatted.append(f"[Source {i}: {source}]\n{doc.page_content}")
    return "\n\n".join(formatted)


def initialize_vector_store() -> Chroma:
    """Connect to the existing ChromaDB vector store."""
    client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)

    embeddings = OllamaEmbeddings(
        model=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL,
    )

    vector_store = Chroma(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
    )

    count = vector_store._collection.count()
    if count == 0:
        print("❌ Vector store is empty. Run 'python ingest.py' first.")
        sys.exit(1)

    return vector_store, count


def initialize_llm() -> ChatGoogleGenerativeAI:
    """Initialize the Google Gemini Chat Model."""
    if not GOOGLE_API_KEY:
        print("❌ GOOGLE_API_KEY not set.")
        print("   Create a .env file with: GOOGLE_API_KEY=your-key-here")
        print("   Get a key at: https://ai.google.dev/gemini-api/docs/api-key")
        sys.exit(1)

    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3,
        max_retries=2,
    )
    return llm


def build_rag_chain(retriever, llm):
    """Build the RAG chain using LCEL."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", RAG_SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{question}"),
    ])

    chain = (
        {
            "context": lambda x: format_docs(retriever.invoke(x["question"])),
            "chat_history": lambda x: x["chat_history"],
            "question": lambda x: x["question"],
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain


# ─── Main Chat Loop ──────────────────────────────────────────────────────────


def main():
    print("=" * 60)
    print("🤖 RAG Chatbot — Powered by LangChain + Chroma + Gemini")
    print("=" * 60)

    # Initialize components
    print("\n⏳ Initializing...")

    print("  📦 Connecting to ChromaDB...", end=" ")
    vector_store, doc_count = initialize_vector_store()
    print(f"✔ ({doc_count} chunks)")

    print(f"  🧠 Loading Gemini model ({GEMINI_MODEL})...", end=" ")
    llm = initialize_llm()
    print("✔")

    # Create retriever (top 4 most similar chunks)
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4},
    )

    # Build chain
    rag_chain = build_rag_chain(retriever, llm)

    # Conversation history
    chat_history = []

    print("\n" + "─" * 60)
    print("💬 Chat is ready! Type your questions below.")
    print("   Commands: 'quit' to exit | 'clear' to reset history")
    print("─" * 60 + "\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n\n👋 Goodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "q"):
            print("\n👋 Goodbye!")
            break

        if user_input.lower() == "clear":
            chat_history.clear()
            print("🗑️  Chat history cleared.\n")
            continue

        # Run the RAG chain
        try:
            response = rag_chain.invoke({
                "question": user_input,
                "chat_history": chat_history,
            })

            # Update conversation history
            chat_history.append(HumanMessage(content=user_input))
            chat_history.append(AIMessage(content=response))

            print(f"\n🤖 Assistant: {response}\n")

        except Exception as e:
            print(f"\n❌ Error: {e}\n")


if __name__ == "__main__":
    main()
