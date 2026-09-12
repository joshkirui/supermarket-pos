#!/bin/bash
clear
echo "╔══════════════════════════════════════════════╗"
echo "║       POS SYSTEM - KENYAN SUPERMARKET        ║"
echo "║       Portable Deployment                    ║"
echo "╚══════════════════════════════════════════════╝"
echo
echo "Choose deployment method:"
echo
echo "  [1] Docker (Recommended)"
echo "  [2] Local install (Node.js + PostgreSQL)"
echo "  [3] Exit"
echo
read -p "  Enter choice (1-3): " choice

case $choice in
  1) docker_deploy ;;
  2) local_deploy ;;
  3) exit ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

docker_deploy() {
  echo
  echo "--- Checking Docker ---"
  if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not found!"
    echo "Install: https://docs.docker.com/get-docker/"
    exit 1
  fi

  if ! docker info &> /dev/null; then
    echo "[ERROR] Docker is not running!"
    echo "Start Docker Desktop and try again."
    exit 1
  fi

  echo "[1/4] Building images..."
  docker-compose build

  echo
  echo "[2/4] Starting database..."
  docker-compose up -d db
  sleep 8

  echo
  echo "[3/4] Running migrations..."
  docker-compose run --rm backend sh -c "npx prisma migrate deploy" 2>/dev/null
  sleep 2

  echo
  echo "[4/4] Starting all services..."
  docker-compose up -d

  echo
  echo "╔══════════════════════════════════════════════╗"
  echo "║           SYSTEM IS RUNNING!                 ║"
  echo "╠══════════════════════════════════════════════╣"
  echo "║  Browser:   http://localhost                 ║"
  echo "║  Backend:   http://localhost:3001            ║"
  echo "║  Login:     admin / 1234                     ║"
  echo "╚══════════════════════════════════════════════╝"
  echo
  echo "Press Ctrl+C to stop services..."
  docker-compose logs -f
}

local_deploy() {
  echo
  echo "--- Local Installation ---"

  if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found!"
    echo "Install: https://nodejs.org/"
    exit 1
  fi

  if ! command -v psql &> /dev/null; then
    echo "[ERROR] PostgreSQL not found!"
    echo "Install: https://www.postgresql.org/download/"
    exit 1
  fi

  echo "[1/4] Installing backend..."
  cd "$(dirname "$0")"
  npm install

  echo
  echo "[2/4] Installing frontend..."
  cd frontend && npm install && cd ..

  echo
  echo "[3/4] Setting up database..."
  npx prisma migrate deploy
  node create-accounts.js

  echo
  echo "[4/4] Building frontend..."
  cd frontend && npm run build && cd ..

  echo
  echo "Starting backend..."
  node dist/main.js &
  BACKEND_PID=$!
  sleep 3

  echo "Starting frontend..."
  cd frontend && npm run dev &
  FRONTEND_PID=$!

  echo
  echo "╔══════════════════════════════════════════════╗"
  echo "║           SYSTEM IS RUNNING!                 ║"
  echo "╠══════════════════════════════════════════════╣"
  echo "║  Browser:   http://localhost:5173            ║"
  echo "║  Login:     admin / 1234                     ║"
  echo "╚══════════════════════════════════════════════╝"
  echo
  echo "Press Ctrl+C to stop..."

  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
  wait
}
