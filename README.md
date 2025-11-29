# Hubli-Dharwad Municipal Corporation RAG System

This is a Retrieval-Augmented Generation (RAG) system designed to assist citizens of Hubli-Dharwad with municipal corporation services and information.

## Backend Setup Instructions

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your Google Gemini API key in the `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```

4. Build the vector database index:
   ```bash
   python build_index.py
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn rag_server:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Setup Instructions

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the required packages:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:3000

## Running Both Backend and Frontend Together

You can start both the backend and frontend simultaneously using the provided script:

On Windows:
```bash
start_full_system.bat
```

On Linux/macOS:
```bash
# Make the script executable first
chmod +x start_full_system.sh
# Then run it
./start_full_system.sh
```

Or run directly with Python:
```bash
python start_full_system.py
```

This will:
1. Build the vector database index (if not already built)
2. Start the FastAPI backend server on port 8000
3. Start the Next.js frontend server on port 3000
4. Display URLs for both services

## Usage

Send a POST request to `http://localhost:8000/rag_query` with a JSON body containing your question:

```bash
curl -X POST "http://localhost:8000/rag_query" \
  -H "Content-Type: application/json" \
  -d '{"question":"There is drainage overflow in Old Hubli near the market, what should be done?","top_k":3}'
```

Or use the web interface at http://localhost:3000 to submit queries through the dashboard.

## Example Response

```json
{
  "answer": "1) Immediate actions: Dispatch sanitation crew to clear blockage, cordon the overflowed area, and arrange temporary pumping if water is deep. 2) Responsible department: Sanitation Department (notify PWD if structural damage). 3) Estimated response time: 6–12 hours for clearance; escalate to Level 2 if unresolved after 24 hours. 4) Explanation: Use drainage SOP to clear debris, disinfect area and notify health department for monitoring.",
  "retrieved": [
    { "id": "...", "text":"...", "source":"department_sops.txt" },
    ...
  ]
}
```

## Google Gemini API Support

This system now uses Google Gemini API instead of OpenAI:
1. Set `GEMINI_API_KEY` in your `.env` file
2. The system uses Gemini Flash 2.0 or Pro 1.5 models which work with free quota
3. No OpenAI API key required

Note: Gemini models are fast and work well with the free quota provided by Google.