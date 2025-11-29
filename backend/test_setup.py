import sys
import os

# Check if we're in the backend directory
print("Current directory:", os.getcwd())

# Check if venv exists
if os.path.exists("venv"):
    print("Virtual environment found")
else:
    print("Virtual environment not found")

# Try to import the modules
modules_to_test = [
    "fastapi",
    "uvicorn",
    "google.generativeai",
    "chromadb",
    "sentence_transformers",
    "joblib",
    "sklearn",
    "dotenv"
]

for module in modules_to_test:
    try:
        __import__(module)
        print(f"✓ {module} - Import successful")
    except ImportError as e:
        print(f"✗ {module} - Import failed: {e}")

print("\nPython executable:", sys.executable)