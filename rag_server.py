# rag_server.py (Gemini RAG version)
import os
import json
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("⚠️ GEMINI_API_KEY not found in .env")

genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

# Add CORS middleware to allow frontend to call this API
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["https://your-frontend-domain"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Embedding Model ----
EMBED_MODEL = "all-MiniLM-L6-v2"
embedder = SentenceTransformer(EMBED_MODEL)

# ---- ChromaDB ----
COLLECTION_NAME = "hdmc_rag"
chroma_client = chromadb.Client()
collection = chroma_client.get_collection(COLLECTION_NAME)

# ---- Request Model ----
class QueryIn(BaseModel):
    question: str
    top_k: int = 3

# ---- RAG Retrieval ----
def retrieve_context(question: str, top_k: int = 3):
    q_emb = embedder.encode([question])[0].tolist()
    results = collection.query(query_embeddings=[q_emb], n_results=top_k)

    docs = []
    for i in range(len(results["ids"][0])):
        docs.append({
            "id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "source": results["metadatas"][0][i].get("source")
        })
    return docs

# ---- Gemini RAG Completion ----
def call_gemini_rag(context_text: str, question: str):
    prompt = f"""
You are a Civic Assistant for Hubli–Dharwad municipal issues.
Use ONLY the context below to answer the question.
If the context does not contain the answer, say:
"Not enough info in local documents. Contact HDMC helpline."

Context:
{context_text}

Question:
{question}

Respond exactly in this format:
1) Immediate actions
2) Responsible department
3) Estimated response time or escalation
4) Short explanation (1–2 lines)
"""

    model = genai.GenerativeModel("gemini-1.5-flash")  # or "gemini-1.5-pro"
    response = model.generate_content(prompt)
    return response.text

# ---- API Endpoint ----
@app.post("/rag_query")
def rag_query(q: QueryIn):
    docs = retrieve_context(q.question, q.top_k)
    combined = "\n\n".join([f"[{d['source']}]\n{d['text']}" for d in docs])

    answer = call_gemini_rag(combined, q.question)

    return {
        "answer": answer,
        "retrieved": docs
    }