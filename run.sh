#!/bin/bash
clear
echo "============================================"
echo "   POS SYSTEM - Kenyan Supermarket"
echo "   Starting all services..."
echo "============================================"
echo

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed!"
    echo "Install from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "[ERROR] Docker is not running!"
    echo "Start Docker Desktop and try again."
    exit 1
fi

echo "[1/3] Building Docker images..."
docker-compose build

echo
echo "[2/3] Starting database..."
docker-compose up -d db
echo "Waiting for database..."
sleep 10

echo
echo "[3/3] Starting all services..."
docker-compose up -d

echo
echo "============================================"
echo "   POS SYSTEM IS RUNNING!"
echo "============================================"
echo
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:3001"
echo "   API Docs:  http://localhost:3001/docs"
echo
echo "   Login:  admin / 1234"
echo "============================================"
echo
echo "Press Ctrl+C to stop all services"
echo

# Keep running and show logs
docker-compose logs -f
