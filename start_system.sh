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

# Check if requirements are installed
echo "Checking/installing requirements..."
pip install -r requirements.txt
echo

# Run the start system script
echo "Starting the RAG system..."
python start_system.py

echo
echo "System stopped."