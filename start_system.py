# start_system.py
import os
import sys
import subprocess
import threading
import time
from dotenv import load_dotenv

def build_index():
    """Build the vector database index"""
    print("Building vector database index...")
    try:
        result = subprocess.run([sys.executable, "build_index.py"], 
                              capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print("✓ Index built successfully")
            return True
        else:
            print("✗ Failed to build index:")
            print(result.stderr)
            return False
    except subprocess.TimeoutExpired:
        print("✗ Index building timed out")
        return False
    except Exception as e:
        print(f"✗ Error building index: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("Starting FastAPI server...")
    try:
        # Start the server in a subprocess
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "rag_server:app", "--reload", "--host", "0.0.0.0", "--port", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ Server started successfully")
        print("Access the API at: http://localhost:8000")
        print("API docs available at: http://localhost:8000/docs")
        return process
    except Exception as e:
        print(f"✗ Error starting server: {e}")
        return None

def main():
    print("Hubli-Dharwad Municipal Corporation RAG System")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check if required files exist
    if not os.path.exists(".env"):
        print("✗ .env file not found. Please create one with your GEMINI_API_KEY.")
        return
    
    if not os.path.exists("rag_data"):
        print("✗ rag_data directory not found. Please create it with the required data files.")
        return
    
    # Build the index
    if not build_index():
        print("Failed to build index. Exiting.")
        return
    
    # Start the server
    server_process = start_server()
    if not server_process:
        print("Failed to start server. Exiting.")
        return
    
    print("\nSystem is now running!")
    print("Press Ctrl+C to stop the server.")
    
    try:
        # Wait for the server process
        server_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server_process.terminate()
        try:
            server_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server_process.kill()
        print("Server stopped.")

if __name__ == "__main__":
    main()