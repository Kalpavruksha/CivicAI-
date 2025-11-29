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

REM Check if requirements are installed
echo Checking/installing requirements...
pip install -r requirements.txt
echo.

REM Run the start system script
echo Starting the RAG system...
python start_system.py

echo.
echo System stopped.
pause