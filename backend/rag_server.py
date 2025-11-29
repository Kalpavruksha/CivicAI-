import os
import google.generativeai as genai
import chromadb
from sentence_transformers import SentenceTransformer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Embedding Model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Chroma vector DB
collection = chromadb.Client().get_collection("hdmc_rag")

class QueryIn(BaseModel):
    question: str
    top_k: int = 3

def retrieve_context(question, top_k):
    q_emb = embedder.encode([question])[0].tolist()
    r = collection.query(query_embeddings=[q_emb], n_results=top_k)

    docs = []
    for i in range(len(r["ids"][0])):
        docs.append({
            "id": r["ids"][0][i],
            "text": r["documents"][0][i],
            "source": r["metadatas"][0][i]["source"],
        })
    return docs

def gemini_rag(context_text, question):
    prompt = f"""
You are an expert municipal assistant for Hubli–Dharwad City.
Use ONLY the context below to answer. 
If incomplete, say: "Not enough information in local documents."

Context:
{context_text}

Question:
{question}

Respond with:
1) Immediate actions
2) Responsible department
3) Response time / escalation
4) Short explanation
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()

@app.post("/rag_query")
def rag_query(q: QueryIn):
    docs = retrieve_context(q.question, q.top_k)
    context = "\n\n".join([f"[{d['source']}]\n{d['text']}" for d in docs])
    answer = gemini_rag(context, q.question)

    return {"answer": answer, "retrieved": docs}