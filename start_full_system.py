# start_full_system.py
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

def start_backend():
    """Start the FastAPI backend server"""
    print("Starting FastAPI backend server...")
    try:
        # Start the server in a subprocess
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "rag_server:app", "--reload", "--host", "0.0.0.0", "--port", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ Backend server started successfully")
        print("Backend API available at: http://localhost:8000")
        return process
    except Exception as e:
        print(f"✗ Error starting backend server: {e}")
        return None

def start_frontend():
    """Start the Next.js frontend server"""
    print("Starting Next.js frontend server...")
    try:
        # Start the server in a subprocess
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], cwd="frontend", stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        print("✓ Frontend server started successfully")
        print("Frontend available at: http://localhost:3000")
        return process
    except Exception as e:
        print(f"✗ Error starting frontend server: {e}")
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
    
    # Start the backend server
    backend_process = start_backend()
    if not backend_process:
        print("Failed to start backend server. Exiting.")
        return
    
    # Wait a moment for the backend to start
    time.sleep(3)
    
    # Start the frontend server
    frontend_process = start_frontend()
    if not frontend_process:
        print("Failed to start frontend server. Exiting.")
        # Terminate the backend process
        backend_process.terminate()
        return
    
    print("\n" + "=" * 50)
    print("Full system is now running!")
    print("Backend API: http://localhost:8000")
    print("Frontend UI: http://localhost:3000")
    print("Press Ctrl+C to stop both servers.")
    
    try:
        # Wait for both processes
        while True:
            if backend_process.poll() is not None or frontend_process.poll() is not None:
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        try:
            backend_process.wait(timeout=10)
            frontend_process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            backend_process.kill()
            frontend_process.kill()
        print("Servers stopped.")

if __name__ == "__main__":
    main()