#!/bin/bash

echo "Hubli-Dharwad Municipal Corporation Backend Services"
echo "==================================================="
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

# Run the start all services script
echo "Starting all backend services..."
python start_all_services.py

echo
echo "All services stopped."