# test_rag.py
import requests
import json

# Test the RAG system
def test_rag_query():
    url = "http://localhost:8000/rag_query"
    headers = {"Content-Type": "application/json"}
    
    # Example query
    payload = {
        "question": "There is drainage overflow in Old Hubli near the market, what should be done?",
        "top_k": 3
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            result = response.json()
            print("Question:", payload["question"])
            print("\nAnswer:", result["answer"])
            print("\nRetrieved Context:")
            for doc in result["retrieved"]:
                print(f"- Source: {doc['source']}")
                print(f"  Content: {doc['text'][:100]}...")
                print()
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    test_rag_query()