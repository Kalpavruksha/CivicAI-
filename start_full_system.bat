@echo off
echo Hubli-Dharwad Municipal Corporation RAG System
echo ==========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Check if backend requirements are installed
echo Checking/installing backend requirements...
pip install -r requirements.txt
echo.

REM Check if frontend dependencies are installed
echo Checking/installing frontend dependencies...
cd frontend
call npm install
cd ..
echo.

REM Run the full system script
echo Starting the full RAG system...
python start_full_system.py

echo.
echo System stopped.
pause