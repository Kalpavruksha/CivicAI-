# combined_server.py — Simplified version without YOLO

import os
import uuid
import shutil
from typing import List

import joblib
import chromadb
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import pandas as pd

# Import the analytics router
from analytics_api import router as analytics_router

# ------------------------------------------------------
# LOAD ENV + KEYS
# ------------------------------------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Only configure the API key if it's available
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GOOGLE_API_KEY_HERE":
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_configured = True
else:
    gemini_configured = False
    print("WARNING: Gemini API key not configured. RAG functionality will be limited.")

# ------------------------------------------------------
# DIRECTORIES
# ------------------------------------------------------
MODEL_DIR = "models"
UPLOAD_DIR = "uploads"
ANNOTATED_DIR = "annotated"

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ANNOTATED_DIR, exist_ok=True)

# ------------------------------------------------------
# FASTAPI APP + CORS + STATIC FILES
# ------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/annotated", StaticFiles(directory=ANNOTATED_DIR), name="annotated")

# Include the analytics router
app.include_router(analytics_router)

# ------------------------------------------------------
# LOAD ML MODELS (Category + Urgency)
# ------------------------------------------------------
vectorizer = joblib.load("models/vectorizer.pkl")
cat_model = joblib.load("models/category_model.pkl")
urg_model = joblib.load("models/urgency_model.pkl")

# ------------------------------------------------------
# LOAD RAG COMPONENTS (if available)
# ------------------------------------------------------
try:
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    chroma = chromadb.PersistentClient(path="./chroma")
    collection = chroma.get_collection("hdmc_rag")
    rag_available = True
except Exception as e:
    print(f"WARNING: RAG components not available: {e}")
    rag_available = False

def retrieve_docs(text, top_k=3):
    if not rag_available:
        return []
        
    try:
        emb = embedder.encode([text])[0].tolist()
        result = collection.query(query_embeddings=[emb], n_results=top_k)

        docs = []
        for i in range(len(result["ids"][0])):
            docs.append({
                "id": result["ids"][0][i],
                "text": result["documents"][0][i],
                "source": result["metadatas"][0][i]["source"]
            })
        return docs
    except Exception as e:
        print(f"Error retrieving docs: {e}")
        return []

def rag_answer(context, query):
    # If Gemini is not configured, return a default response
    if not gemini_configured:
        return "Gemini API not configured. Please set up the GEMINI_API_KEY in the .env file for full RAG functionality.\n\nImmediate Action: Contact local authorities\nResponsible Department: Municipal Corporation\nTime Estimate: 24-48 hours\nShort Explanation: This issue requires attention from the relevant department. Please follow up with local authorities for resolution."
    
    prompt = f"""
You are a Hubli–Dharwad Civic Issue Expert.

Use ONLY the context below. If context is insufficient, say:
"Not enough information in official HDMC documents."

Context:
{context}

Query:
{query}

Respond with:
1) Immediate Action  
2) Responsible Department  
3) Time Estimate  
4) Short Explanation  
"""

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        resp = model.generate_content(prompt)
        return resp.text.strip()
    except Exception as e:
        print(f"Error generating RAG response: {e}")
        return "Unable to generate response at this time. Please try again later."

# ------------------------------------------------------
# TEXT-ONLY ENDPOINT
# ------------------------------------------------------
class TextRequest(BaseModel):
    text: str
    top_k: int = 3

@app.post("/analyze")
def analyze(data: TextRequest):
    X = vectorizer.transform([data.text])
    category = cat_model.predict(X)[0]
    urgency = urg_model.predict(X)[0]

    docs = retrieve_docs(data.text, data.top_k)
    context = "\n\n".join([d["text"] for d in docs])
    action = rag_answer(context, data.text)

    return {
        "category": category,
        "urgency": urgency,
        "recommended_action": action,
        "retrieved": docs
    }

# --- Add /hotspots endpoint to combined_server.py ---

# helper to convert urgency label to numeric score
URGENCY_SCORE = {"Low": 1, "Medium": 2, "High": 3}

@app.get("/hotspots")
def hotspots():
    """
    Returns JSON with aggregated hotspots:
    [
      {
        "area": "Gokul Road Market",
        "lat": 15.344165,
        "lng": 75.143525,
        "count": 12,
        "avg_urgency_score": 1.83,
        "avg_urgency_label": "Medium",
        "sample_text": "A big pothole near Gokul Road Market..."
      },
      ...
    ]
    """
    # path to your CSV (update if different)
    csv_candidates = [
        "data/complaints_hdmc.csv",        # earlier suggestions
        "data/complaints.csv",
        "data/complaints/complaints.csv",
        "complaints.csv"
    ]
    csv_path = None
    for p in csv_candidates:
        if os.path.exists(p):
            csv_path = p
            break

    if csv_path is None:
        raise HTTPException(status_code=500, detail="complaints CSV not found. Place at data/complaints.csv or similar.")

    df = pd.read_csv(csv_path)

    # ensure columns exist
    required = ["ComplaintText", "Area", "Latitude", "Longitude", "Urgency"]
    for c in required:
        if c not in df.columns:
            raise HTTPException(status_code=500, detail=f"CSV missing column: {c}")

    # drop bad rows
    df = df.dropna(subset=["Latitude", "Longitude", "Area", "ComplaintText", "Urgency"])

    # aggregate by rounded lat/lng to combine very near points (grid aggregation)
    df["lat_rounded"] = df["Latitude"].round(5)   # adjust precision if needed
    df["lng_rounded"] = df["Longitude"].round(5)

    grouped = df.groupby(["Area", "lat_rounded", "lng_rounded"]).agg(
        count = ("ComplaintText", "count"),
        avg_urgency_score = ("Urgency", lambda s: sum(URGENCY_SCORE.get(x,1) for x in s) / len(s)),
        sample_text = ("ComplaintText", lambda s: s.iloc[0])
    ).reset_index()

    # map numeric avg back to label
    def score_to_label(score):
        if score >= 2.5: return "High"
        if score >= 1.5: return "Medium"
        return "Low"

    hotspots = []
    for _, r in grouped.iterrows():
        hotspots.append({
            "area": r["Area"],
            "lat": float(r["lat_rounded"]),
            "lng": float(r["lng_rounded"]),
            "count": int(r["count"]),
            "avg_urgency_score": float(round(float(r["avg_urgency_score"]), 2)),
            "avg_urgency_label": score_to_label(r["avg_urgency_score"]),
            "sample_text": str(r["sample_text"])
        })

    # additionally compute city bounds or summary if you want
    return {"hotspots": hotspots}

# ------------------------------------------------------
# ADD MAP DATA ENDPOINT
# ------------------------------------------------------

@app.get("/complaints/map")
def complaints_map():
    # For now, we'll return mock data
    # In a full implementation, this would query your database
    mock_complaints = [
        {
            "longitude": 75.1239,
            "latitude": 15.3647,
            "category": "Pothole",
            "urgency": "High",
            "area": "Hubli Central",
            "text": "Large pothole causing traffic issues"
        },
        {
            "longitude": 75.1339,
            "latitude": 15.3547,
            "category": "Garbage",
            "urgency": "Medium",
            "area": "Dharwad East",
            "text": "Garbage collection needed"
        },
        {
            "longitude": 75.1139,
            "latitude": 15.3747,
            "category": "Drainage",
            "urgency": "High",
            "area": "Hubli West",
            "text": "Waterlogging after rains"
        },
        {
            "longitude": 75.1439,
            "latitude": 15.3847,
            "category": "Electricity",
            "urgency": "Medium",
            "area": "Dharwad Central",
            "text": "Street light not working"
        },
        {
            "longitude": 75.1039,
            "latitude": 15.3947,
            "category": "Pothole",
            "urgency": "Low",
            "area": "Unkal Lake",
            "text": "Small crack in road"
        }
    ]
    return {"data": mock_complaints}

# ------------------------------------------------------
# ADD MAP ENDPOINT FOR ISSUE LISTING
# ------------------------------------------------------

@app.get("/list-issues")
def list_issues():
    # For now, we'll return mock data since we don't have MongoDB integration yet
    # In a full implementation, this would query your MongoDB collection
    mock_issues = [
        {
            "lat": 15.3647,
            "lng": 75.1239,
            "category": "pothole",
            "urgency": "High",
            "area": "Hubli Central",
            "image": None
        },
        {
            "lat": 15.3547,
            "lng": 75.1339,
            "category": "garbage",
            "urgency": "Medium",
            "area": "Dharwad East",
            "image": None
        },
        {
            "lat": 15.3747,
            "lng": 75.1139,
            "category": "drainage",
            "urgency": "High",
            "area": "Hubli West",
            "image": None
        },
        {
            "lat": 15.3847,
            "lng": 75.1439,
            "category": "hazard",
            "urgency": "Critical",
            "area": "Dharwad Central",
            "image": None
        }
    ]
    return mock_issues

# ------------------------------------------------------
# ADD HISTORY ENDPOINT FOR YOLO DETECTIONS
# ------------------------------------------------------

@app.get("/history")
def history():
    # For now, we'll return mock data since we don't have MongoDB integration yet
    # In a full implementation, this would query your MongoDB collection
    mock_entries = [
        {
            "id": "1",
            "timestamp": "2025-11-17T10:30:00Z",
            "category": "pothole",
            "urgency": "High",
            "area": "Hubli Central",
            "lat": 15.3647,
            "lng": 75.1239,
            "image": None,
            "yolo_boxes": [
                {"x": 100, "y": 150, "width": 50, "height": 50, "class": "pothole", "confidence": 0.95}
            ],
        },
        {
            "id": "2",
            "timestamp": "2025-11-17T09:15:00Z",
            "category": "garbage",
            "urgency": "Medium",
            "area": "Dharwad East",
            "lat": 15.3547,
            "lng": 75.1339,
            "image": None,
            "yolo_boxes": [
                {"x": 200, "y": 300, "width": 75, "height": 75, "class": "garbage", "confidence": 0.87}
            ],
        },
        {
            "id": "3",
            "timestamp": "2025-11-16T14:45:00Z",
            "category": "drainage",
            "urgency": "High",
            "area": "Hubli West",
            "lat": 15.3747,
            "lng": 75.1139,
            "image": None,
            "yolo_boxes": [
                {"x": 150, "y": 200, "width": 60, "height": 60, "class": "drainage", "confidence": 0.92}
            ],
        }
    ]
    return mock_entries