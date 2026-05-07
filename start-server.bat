@echo off
cd /d "%~dp0"
echo Starting server on http://localhost:3000
python -m http.server 3000
