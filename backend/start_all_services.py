# start_all_services.py
import os
import sys
import subprocess
import time
from dotenv import load_dotenv

def train_models():
    """Train the ML models"""
    print("Training ML models...")
    try:
        result = subprocess.run([sys.executable, "train_classifier.py"], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print("✓ Models trained successfully")
            return True
        else:
            print("✗ Failed to train models:")
            print(result.stderr)
            return False
    except subprocess.TimeoutExpired:
        print("✗ Model training timed out")
        return False
    except Exception as e:
        print(f"✗ Error training models: {e}")
        return False

def start_rag_service():
    """Start the RAG service"""
    print("Starting RAG service...")
    try:
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "rag_server:app", "--reload", "--port", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ RAG service started on http://localhost:8000")
        return process
    except Exception as e:
        print(f"✗ Error starting RAG service: {e}")
        return None

def start_predict_service():
    """Start the predict service"""
    print("Starting predict service...")
    try:
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "predict_server:app", "--reload", "--port", "8001"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ Predict service started on http://localhost:8001")
        return process
    except Exception as e:
        print(f"✗ Error starting predict service: {e}")
        return None

def start_combined_service():
    """Start the combined service"""
    print("Starting combined service...")
    try:
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "combined_server:app", "--reload", "--port", "8002"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ Combined service started on http://localhost:8002")
        return process
    except Exception as e:
        print(f"✗ Error starting combined service: {e}")
        return None

def main():
    print("Hubli-Dharwad Municipal Corporation Backend Services")
    print("=" * 55)
    
    # Load environment variables
    load_dotenv()
    
    # Check if required files exist
    if not os.path.exists(".env"):
        print("✗ .env file not found. Please create one with your GEMINI_API_KEY.")
        return
    
    if not os.path.exists("data/complaints_hdmc.csv"):
        print("✗ data/complaints_hdmc.csv not found. Please add your complaints data.")
        return
    
    # Train models if not already trained
    if not os.path.exists("models/vectorizer.pkl"):
        if not train_models():
            print("Failed to train models. Exiting.")
            return
    else:
        print("✓ ML models already trained")
    
    # Start all services
    rag_process = start_rag_service()
    if not rag_process:
        print("Failed to start RAG service. Exiting.")
        return
    
    # Wait a moment for the RAG service to start
    time.sleep(2)
    
    predict_process = start_predict_service()
    if not predict_process:
        print("Failed to start predict service. Exiting.")
        # Terminate the RAG process
        rag_process.terminate()
        return
    
    # Wait a moment for the predict service to start
    time.sleep(2)
    
    combined_process = start_combined_service()
    if not combined_process:
        print("Failed to start combined service. Exiting.")
        # Terminate the other processes
        rag_process.terminate()
        predict_process.terminate()
        return
    
    print("\n" + "=" * 55)
    print("All backend services are now running!")
    print("RAG Service:     http://localhost:8000")
    print("Predict Service: http://localhost:8001")
    print("Combined Service: http://localhost:8002")
    print("Press Ctrl+C to stop all services.")
    
    try:
        # Wait for all processes
        while True:
            if (rag_process.poll() is not None or 
                predict_process.poll() is not None or 
                combined_process.poll() is not None):
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down all services...")
        rag_process.terminate()
        predict_process.terminate()
        combined_process.terminate()
        try:
            rag_process.wait(timeout=10)
            predict_process.wait(timeout=10)
            combined_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            rag_process.kill()
            predict_process.kill()
            combined_process.kill()
        print("All services stopped.")

if __name__ == "__main__":
    main()