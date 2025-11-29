# Backend System for Hubli-Dharwad Municipal Corporation

This backend provides three main services:
1. RAG (Retrieval-Augmented Generation) using Google Gemini 2.0
2. ML Classifier for complaint categorization and urgency detection
3. Combined service that provides both classification and RAG recommendations

## Setup Instructions

1. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Set your Google Gemini API key in the `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Ensure you have the complaints data in [data/complaints_hdmc.csv](data/complaints_hdmc.csv)

4. Train the classifier models:
   ```bash
   python train_classifier.py
   ```

## Running All Services

You can start all backend services simultaneously using the provided script:

On Windows:
```bash
start_all_services.bat
```

On Linux/macOS:
```bash
# Make the script executable first
chmod +x start_all_services.sh
# Then run it
./start_all_services.sh
```

Or run directly with Python:
```bash
python start_all_services.py
```

This will:
1. Train the ML models (if not already trained)
2. Start the RAG service on port 8000
3. Start the classifier service on port 8001
4. Start the combined service on port 8002
5. Display URLs for all services

## Services

### 1. RAG Service
Run the RAG service:
```bash
uvicorn rag_server:app --reload --port 8000
```

API endpoint: `POST /rag_query`
```json
{
  "question": "There is drainage overflow in Old Hubli near the market",
  "top_k": 3
}
```

### 2. Classifier Service
Run the classifier service:
```bash
uvicorn predict_server:app --reload --port 8001
```

API endpoint: `POST /predict`
```json
{
  "text": "There is drainage overflow in Old Hubli near the market"
}
```

### 3. Combined Service
Run the combined service:
```bash
uvicorn combined_server:app --reload --port 8002
```

API endpoint: `POST /analyze`
```json
{
  "text": "There is drainage overflow in Old Hubli near the market"
}
```

## Updated to use Google AI SDK v2

This backend now uses:
- Google AI SDK v2
- Gemini 2.0 Flash model (fast and cost-effective)
- New API calling methods
- Updated response structure

## File Structure
```
backend/
│
├── rag_server.py              ← RAG API (Gemini 2.0 Flash)
├── predict_server.py          ← Classifier API
├── combined_server.py         ← Combined output
│
├── train_classifier.py        ← Train ML classifier
│
├── requirements.txt           ← Backend dependencies
│
├── data/
│     └── complaints_hdmc.csv  ← Complaints CSV
│
└── models/
      ├── vectorizer.pkl
      ├── category_model.pkl
      └── urgency_model.pkl
```