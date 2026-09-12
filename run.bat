@echo off
title POS System - Kenyan Supermarket
color 0A

echo ============================================
echo    POS SYSTEM - Kenyan Supermarket
echo    Starting all services...
echo ============================================
echo.

:: Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed!
    echo.
    echo Please install Docker Desktop from:
    echo   https://www.docker.com/products/docker-desktop/
    echo.
    echo After installing, restart your computer and run this script again.
    pause
    exit /b 1
)

:: Check if Docker is running
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/3] Building Docker images (first time takes 2-3 minutes)...
docker-compose build

echo.
echo [2/3] Starting database...
docker-compose up -d db
echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [3/3] Starting all services...
docker-compose up -d

echo.
echo ============================================
echo    POS SYSTEM IS RUNNING!
echo ============================================
echo.
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:3001
echo    API Docs:  http://localhost:3001/docs
echo.
echo    Login:  admin / 1234
echo ============================================
echo.
echo    Press any key to stop all services...
echo ============================================
pause >nul

echo.
echo Stopping services...
docker-compose down
echo Services stopped.
pause
