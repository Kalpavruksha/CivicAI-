import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML models
vectorizer = joblib.load("models/vectorizer.pkl")
cat_model = joblib.load("models/category_model.pkl")
urg_model = joblib.load("models/urgency_model.pkl")

class PredictIn(BaseModel):
    text: str

@app.post("/predict")
def predict(p: PredictIn):
    X = vectorizer.transform([p.text])
    cat = cat_model.predict(X)[0]
    urg = urg_model.predict(X)[0]
    return {"category": cat, "urgency": urg}