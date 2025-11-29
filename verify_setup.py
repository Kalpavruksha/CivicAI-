# verify_setup.py
import os
import sys
from dotenv import load_dotenv

def check_python_version():
    """Check if Python 3.7+ is installed"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 7:
        print(f"✓ Python version OK: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"✗ Python version too old: {version.major}.{version.minor}.{version.micro}")
        print("  Please upgrade to Python 3.7 or newer")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists(".env"):
        print("✗ .env file not found")
        print("  Please create a .env file with GEMINI_API_KEY variable")
        return False
    
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("✗ GEMINI_API_KEY not set in .env file")
        print("  Please set GEMINI_API_KEY")
        return False
    else:
        print("✓ GEMINI_API_KEY found in .env")
    
    return True

def check_required_packages():
    """Check if required packages are installed"""
    required_packages = [
        "fastapi",
        "uvicorn",
        "langchain",
        "chromadb",
        "sentence-transformers",
        "google-generativeai",
        "python-dotenv",
        "pydantic"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.split("[")[0])  # Handle packages with extras like uvicorn[standard]
            print(f"✓ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"✗ {package}")
    
    if missing_packages:
        print(f"\nMissing packages: {', '.join(missing_packages)}")
        print("Install with: pip install -r requirements.txt")
        return False
    else:
        print("✓ All required packages installed")
        return True

def check_data_files():
    """Check if rag_data directory and files exist"""
    if not os.path.exists("rag_data"):
        print("✗ rag_data directory not found")
        return False
    
    required_files = [
        "hdmc_rules.txt",
        "department_sops.txt",
        "department_roles.txt",
        "past_complaints_solutions.json",
        "ward_info.txt",
        "disaster_sop.txt",
        "public_services.txt",
        "common_issues.txt"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(os.path.join("rag_data", file)):
            missing_files.append(file)
            print(f"✗ rag_data/{file}")
        else:
            print(f"✓ rag_data/{file}")
    
    if missing_files:
        print(f"\nMissing data files: {', '.join(missing_files)}")
        return False
    else:
        print("✓ All required data files present")
        return True

def main():
    print("Checking Hubli-Dharwad RAG System Setup...\n")
    
    checks = [
        ("Python Version", check_python_version),
        (".env Configuration", check_env_file),
        ("Required Packages", check_required_packages),
        ("Data Files", check_data_files)
    ]
    
    all_passed = True
    for name, check_func in checks:
        print(f"\n{name}:")
        if not check_func():
            all_passed = False
    
    print("\n" + "="*50)
    if all_passed:
        print("✓ All checks passed! You're ready to run the RAG system.")
        print("\nNext steps:")
        print("1. Build the index: python build_index.py")
        print("2. Start the server: uvicorn rag_server:app --reload")
    else:
        print("✗ Some checks failed. Please fix the issues above.")

if __name__ == "__main__":
    main()