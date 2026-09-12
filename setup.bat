@echo off
title POS System - Kenyan Supermarket
color 0A
cls

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║       POS SYSTEM - KENYAN SUPERMARKET        ║
echo  ║       Portable Deployment                    ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Choose deployment method:
echo.
echo  [1] Docker (Recommended)
echo  [2] Local install (Node.js + PostgreSQL)
echo  [3] Build Windows EXE
echo  [4] Exit
echo.
set /p choice="  Enter choice (1-4): "

if "%choice%"=="1" goto docker
if "%choice%"=="2" goto local
if "%choice%"=="3" goto build
if "%choice%"=="4" goto end

echo Invalid choice.
pause
goto end

:docker
echo.
echo --- Checking Docker ---
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found!
    echo Install Docker Desktop: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    goto end
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    goto end
)

echo.
echo [1/4] Building images (first time: 2-3 min)...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    goto end
)

echo.
echo [2/4] Starting database...
docker-compose up -d db
echo Waiting for PostgreSQL...
timeout /t 8 /nobreak >nul

echo.
echo [3/4] Running migrations and seed...
docker-compose run --rm backend sh -c "npx prisma migrate deploy" 2>nul
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting all services...
docker-compose up -d

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║           SYSTEM IS RUNNING!                 ║
echo  ╠══════════════════════════════════════════════╣
echo  ║  Browser:   http://localhost                 ║
echo  ║  Backend:   http://localhost:3001            ║
echo  ║  API Docs:  http://localhost:3001/docs       ║
echo  ║  Login:     admin / 1234                     ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Press any key to STOP services...
pause >nul

echo.
echo Stopping...
docker-compose down
echo Done.
pause
goto end

:local
echo.
echo --- Local Installation ---
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Download: https://nodejs.org/
    pause
    goto end
)

:: Check PostgreSQL
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL not found!
    echo Download: https://www.postgresql.org/download/windows/
    pause
    goto end
)

echo [1/4] Installing backend dependencies...
cd /d "%~dp0"
call npm install

echo.
echo [2/4] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo [3/4] Setting up database...
call npx prisma migrate deploy
call node create-accounts.js

echo.
echo [4/4] Building and starting...
cd frontend
start /b npm run build
cd ..

:: Start backend in background
start /b node dist/main.js

:: Wait and start frontend
timeout /t 5 /nobreak >nul
cd frontend
start npm run dev

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║           SYSTEM IS RUNNING!                 ║
echo  ╠══════════════════════════════════════════════╣
echo  ║  Browser:   http://localhost:5173            ║
echo  ║  Backend:   http://localhost:3001            ║
echo  ║  Login:     admin / 1234                     ║
echo  ╚══════════════════════════════════════════════╝
echo.
pause
goto end

:build
echo.
echo --- Building Windows EXE ---
echo.

cd frontend
call npm install
echo.
echo Building frontend...
call npm run build
echo.
echo Packaging as Windows EXE...
call npx electron-builder build --win --config electron-builder.json
echo.

if exist "release\POS-System-Kenya-1.0.0-portable.exe" (
    echo  ╔══════════════════════════════════════════════╗
    echo  ║           BUILD SUCCESSFUL!                  ║
    echo  ╠══════════════════════════════════════════════╣
    echo  ║  EXE: frontend\release\                      ║
    echo  ║  Run this file on any Windows PC             ║
    echo  ╚══════════════════════════════════════════════╝
) else (
    echo [ERROR] Build failed. Check errors above.
)

cd ..
pause
goto end

:end
