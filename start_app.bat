@echo off
cd /d "%~dp0"
echo FactBuilder running at http://localhost:8123  (Ctrl+C to stop)
start "" http://localhost:8123
"%~dp0venv\Scripts\python.exe" -m http.server 8123 --bind 127.0.0.1
