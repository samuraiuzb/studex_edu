@echo off
echo === MathTestUZ Frontend ===
cd /d "%~dp0frontend"
echo [1/2] Installing Node dependencies...
npm install
echo [2/2] Starting dev server on http://localhost:5173 ...
npm run dev
pause
