# build_index.py
import os
import json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chromadb

DATA_DIR = Path("rag_data")
MODEL_NAME = "all-MiniLM-L6-v2"
COLLECTION_NAME = "hdmc_rag"

def load_text_files(data_dir):
    docs = []
    for p in sorted(data_dir.iterdir()):
        if p.suffix.lower() in [".txt", ".md"]:
            docs.append({"source": p.name, "text": p.read_text(encoding="utf8")})
        elif p.suffix.lower() == ".json":
            try:
                raw = json.loads(p.read_text(encoding="utf8"))
                # if list of dicts with complaint/solution, convert to text
                if isinstance(raw, list):
                    for i, item in enumerate(raw):
                        docs.append({"source": f"{p.name}::{i}", "text": json.dumps(item)})
                else:
                    docs.append({"source": p.name, "text": json.dumps(raw)})
            except Exception as e:
                docs.append({"source": p.name, "text": p.read_text(encoding="utf8")})
    return docs

def chunk_documents(docs):
    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=80)
    all_chunks = []
    for d in docs:
        chunks = splitter.split_text(d["text"])
        for i, c in enumerate(chunks):
            all_chunks.append({"id": f"{d['source']}__{i}", "text": c, "source": d['source']})
    return all_chunks

def embed_and_store(chunks, model_name=MODEL_NAME):
    print("Loading embedder:", model_name)
    embedder = SentenceTransformer(model_name)
    # Use persistent ChromaDB client
    print("Creating persistent ChromaDB client at ./backend/chroma")
    chroma_client = chromadb.PersistentClient(path="./backend/chroma")
    print("Checking if collection exists...")
    try:
        collection = chroma_client.get_collection(COLLECTION_NAME)
        print("Collection exists, deleting it...")
        chroma_client.delete_collection(COLLECTION_NAME)
    except Exception as e:
        print("Collection does not exist or error:", str(e))
        pass
    print("Creating new collection...")
    collection = chroma_client.create_collection(COLLECTION_NAME)
    texts = [c["text"] for c in chunks]
    ids = [c["id"] for c in chunks]
    sources = [c["source"] for c in chunks]
    print("Embedding", len(texts), "chunks — this may take a while...")
    embeddings = embedder.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    # add to chroma collection
    print("Adding documents to collection...")
    collection.add(ids=ids, documents=texts, metadatas=[{"source": s} for s in sources], embeddings=embeddings.tolist())
    print("Stored", len(ids), "chunks into ChromaDB collection:", COLLECTION_NAME)

if __name__ == "__main__":
    print("Loading documents from", DATA_DIR)
    docs = load_text_files(DATA_DIR)
    print("Loaded", len(docs), "documents.")
    chunks = chunk_documents(docs)
    print("Created", len(chunks), "chunks.")
    embed_and_store(chunks)