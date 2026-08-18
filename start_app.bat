@echo off
cd /d "%~dp0"
echo FactBuilder running at http://localhost:8123  (Ctrl+C to stop)
start "" http://localhost:8123
node server.mjs
