@echo off
title Resellara Frontend (React + Vite)
echo ===================================================
echo Starting Resellara Frontend Dev Server...
echo URL: http://localhost:5173
echo ===================================================

cd /d "%~dp0frontend"
npm run dev
pause
