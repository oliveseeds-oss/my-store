@echo off
title Olive Seeds Studio Local Servers
echo ======================================================================
echo           Starting Olive Seeds Studio Local Servers
echo ======================================================================
echo.
echo Please make sure MySQL is started in XAMPP Control Panel!
echo.

echo [1/3] Starting Backend Server on http://localhost:5000 ...
start "Backend API (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Public Website on http://localhost:3001 ...
start "Public Storefront (Port 3001)" cmd /k "cd /d "%~dp0public-website" && npm start"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Admin Panel on http://localhost:3000 ...
start "Admin Panel (Port 3000)" cmd /k "cd /d "%~dp0admin-panel" && npm start"

echo.
echo ======================================================================
echo   All 3 services launched in dedicated terminal windows:
echo     - Backend API:    http://localhost:5000
echo     - Public Website: http://localhost:3001
echo     - Admin Panel:    http://localhost:3000
echo ======================================================================
echo.
pause
