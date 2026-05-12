"""
ingest.py — Document Ingestion Pipeline
========================================
Loads PDF and text documents from the data directory, splits them into chunks,
generates embeddings via Ollama (nomic-embed-text), and persists
them into a local ChromaDB vector store.

Usage:
    python ingest.py
    python ingest.py --data-dir "D:/ETL/Spider/Spider/I - Kannon/output/pdfs"
    python ingest.py --chunk-size 800 --chunk-overlap 100
    python ingest.py --batch-size 100
"""

import os
import sys
import time
import argparse
import glob
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
import chromadb

# ─── Configuration ────────────────────────────────────────────────────────────

load_dotenv()

CHROMA_HOST = "localhost"
CHROMA_PORT = 8001
COLLECTION_NAME = "rag_chatbot"
EMBEDDING_MODEL = "nomic-embed-text"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Default data source: Indian Kanoon scraped PDFs
DEFAULT_DATA_DIR = r"D:\ETL\Spider\Spider\I - Kannon\output\pdfs"


def load_documents(data_dir: str, user_id: str = None) -> list:
    """Load all .pdf and .txt files from the given directory (recursively)."""
    documents = []
    errors = []

    # ── Load PDF files ─────────────────────────────────────────────────────
    pdf_files = glob.glob(os.path.join(data_dir, "**", "*.pdf"), recursive=True)
    if pdf_files:
        print(f"\n  Found {len(pdf_files)} PDF file(s)")
    for i, file_path in enumerate(pdf_files, 1):
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            # Enrich metadata with court and year from folder structure
            # Expected structure: .../pdfs/<court>/<year>/<filename>.pdf
            parts = os.path.normpath(file_path).split(os.sep)
            for doc in docs:
                doc.metadata["source"] = file_path
                if user_id:
                    doc.metadata["user_id"] = user_id
                # Try to extract court and year from path
                try:
                    pdf_idx = next(i for i, p in enumerate(parts) if p == "pdfs")
                    if pdf_idx + 1 < len(parts):
                        doc.metadata["court"] = parts[pdf_idx + 1]
                    if pdf_idx + 2 < len(parts):
                        doc.metadata["year"] = parts[pdf_idx + 2]
                except StopIteration:
                    pass
            documents.extend(docs)
            # Progress indicator every 50 files
            if i % 50 == 0 or i == len(pdf_files):
                print(f"  Loaded {i}/{len(pdf_files)} PDFs ({len(documents)} pages so far)")
        except Exception as e:
            errors.append((file_path, str(e)))

    # ── Load TXT files ─────────────────────────────────────────────────────
    txt_files = glob.glob(os.path.join(data_dir, "**", "*.txt"), recursive=True)
    if txt_files:
        print(f"\n  Found {len(txt_files)} TXT file(s)")
    for file_path in txt_files:
        try:
            loader = TextLoader(file_path, encoding="utf-8")
            loaded_docs = loader.load()
            for doc in loaded_docs:
                if user_id:
                    doc.metadata["user_id"] = user_id
            documents.extend(loaded_docs)
        except Exception as e:
            errors.append((file_path, str(e)))

    if errors:
        print(f"\n   {len(errors)} file(s) had errors and were skipped.")

    return documents


def split_documents(documents: list, chunk_size: int = 500, chunk_overlap: int = 50) -> list:
    """Split documents into smaller chunks for embedding."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = text_splitter.split_documents(documents)
    return chunks


def create_vector_store_batched(chunks: list, batch_size: int = 100) -> Chroma:
    """Create embeddings in batches with progress tracking and persist to ChromaDB."""
    print(f"\n Connecting to Ollama at {OLLAMA_BASE_URL}...")
    print(f" Using embedding model: {EMBEDDING_MODEL}")
    print(f" Connecting to ChromaDB Server at {CHROMA_HOST}:{CHROMA_PORT}...")
    print(f" Processing {len(chunks)} chunks in batches of {batch_size}\n")

    embeddings = OllamaEmbeddings(
        model=EMBEDDING_MODEL,
        base_url=OLLAMA_BASE_URL,
    )

    total_chunks = len(chunks)
    total_batches = (total_chunks + batch_size - 1) // batch_size
    start_time = time.time()
    
    client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    vector_store = Chroma(
        client=client,
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
    )

    for batch_num in range(total_batches):
        batch_start = batch_num * batch_size
        batch_end = min(batch_start + batch_size, total_chunks)
        batch = chunks[batch_start:batch_end]

        batch_time = time.time()
        vector_store.add_documents(documents=batch)

        elapsed = time.time() - start_time
        batch_elapsed = time.time() - batch_time
        progress = (batch_end / total_chunks) * 100
        chunks_per_sec = batch_end / elapsed if elapsed > 0 else 0
        eta = (total_chunks - batch_end) / chunks_per_sec if chunks_per_sec > 0 else 0

        print(
            f"  - Batch {batch_num + 1}/{total_batches} "
            f"[{batch_end}/{total_chunks} chunks | {progress:.1f}%] "
            f"- {batch_elapsed:.1f}s/batch, ETA: {eta:.0f}s"
        )

    total_time = time.time() - start_time
    print(f"\n  Total embedding time: {total_time:.1f}s ({total_time/60:.1f} min)")

    return vector_store


def main():
    parser = argparse.ArgumentParser(description="Ingest documents into ChromaDB")
    parser.add_argument(
        "--data-dir",
        type=str,
        default=DEFAULT_DATA_DIR,
        help=f"Directory containing documents to ingest (default: {DEFAULT_DATA_DIR})",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=500,
        help="Size of text chunks (default: 500)",
    )
    parser.add_argument(
        "--chunk-overlap",
        type=int,
        default=50,
        help="Overlap between chunks (default: 50)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Number of chunks per embedding batch (default: 100)",
    )
    parser.add_argument(
        "--user-id",
        type=str,
        default=None,
        help="Firebase User ID to tag the metadata with for data isolation",
    )
    args = parser.parse_args()

    # ── Step 1: Load documents ─────────────────────────────────────────────
    print("=" * 60)
    print(" RAG Chatbot — Document Ingestion")
    print("=" * 60)

    if not os.path.exists(args.data_dir):
        print(f"\n Data directory not found: {args.data_dir}")
        print("   Please check the path and try again.")
        sys.exit(1)

    print(f"\n Loading documents from: {args.data_dir}")
    if args.user_id:
        print(f" Tagging documents with user_id: {args.user_id}")
    documents = load_documents(args.data_dir, args.user_id)

    if not documents:
        print("\n No documents found. Add .pdf or .txt files to the data directory.")
        sys.exit(1)

    print(f"\n Loaded {len(documents)} document page(s) total")

    # ── Step 2: Split into chunks ──────────────────────────────────────────
    print(f"\n  Splitting into chunks (size={args.chunk_size}, overlap={args.chunk_overlap})...")
    chunks = split_documents(documents, args.chunk_size, args.chunk_overlap)
    print(f"   Created {len(chunks)} chunk(s)")

    # ── Step 3: Create embeddings & store (batched) ────────────────────────
    print("\n Generating embeddings and storing in ChromaDB...")
    vector_store = create_vector_store_batched(chunks, args.batch_size)

    # ── Step 4: Verify ─────────────────────────────────────────────────────
    count = vector_store._collection.count()
    print(f"\n Successfully ingested {count} chunks into ChromaDB!")
    print(f"   Collection Name: {COLLECTION_NAME}")
    print(f"   Chroma Server: {CHROMA_HOST}:{CHROMA_PORT}")
    print("============================================================")
    print("=" * 60)


if __name__ == "__main__":
    main()
