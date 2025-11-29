#!/bin/bash

echo "Hubli-Dharwad Municipal Corporation RAG System"
echo "=========================================="
echo

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo

# Check if backend requirements are installed
echo "Checking/installing backend requirements..."
pip install -r requirements.txt
echo

# Check if frontend dependencies are installed
echo "Checking/installing frontend dependencies..."
cd frontend
npm install
cd ..
echo

# Run the full system script
echo "Starting the full RAG system..."
python start_full_system.py

echo
echo "System stopped."