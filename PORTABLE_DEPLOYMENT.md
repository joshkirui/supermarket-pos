# POS System — Portable Deployment Guide

## Option 1: Docker (Recommended — Easiest)

One command starts everything: database, backend, and frontend.

### Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps
```bash
# Windows — double-click run.bat
# OR in terminal:
docker-compose up -d

# Access at: http://localhost
# Login: admin / 1234
```

### Stop
```bash
docker-compose down
```

---

## Option 2: Portable Windows EXE (No Docker needed)

Builds a single `.exe` file that runs the frontend as a desktop app.
**Requires PostgreSQL running locally.**

### Steps
```bash
cd frontend
npm install
npm run build
npm run package
```

Output: `frontend/release/POS-System-Kenya-1.0.0-portable.exe`

---

## Option 3: Burnable USB Image

### What you need
- USB drive (8GB+)
- [Rufus](https://rufus.ie/) or [balenaEtcher](https://etcher.balena.io/)
- Docker Desktop installer
- Project files

### Steps
1. Format USB as exFAT
2. Copy the entire `pos-backend` folder to USB
3. Copy Docker Desktop installer to USB
4. Create `SETUP.txt` with instructions below

### To use on any Windows PC
1. Install Docker Desktop from USB
2. Restart PC
3. Open terminal, navigate to USB:\pos-backend
4. Run: `docker-compose up -d`
5. Open browser to http://localhost

---

## Option 4: ISO Image (True Bootable)

### Create ISO with mkisofs (Linux/Mac)
```bash
# Install mkisofs
sudo apt-get install genisoimage

# Create ISO
mkisofs -r -J -V "POS-SYSTEM" -o pos-system.iso pos-backend/
```

### Create ISO with ImgBurn (Windows)
1. Download [ImgBurn](https://www.imgburn.com/)
2. Select "Create image file from files/folders"
3. Add pos-backend folder
4. Set label to "POS-SYSTEM"
5. Build ISO

### Burn to USB
Use [Rufus](https://rufus.ie/) to write the ISO to USB.

---

## Default Login Credentials

| Username | PIN  | Role       |
|----------|------|------------|
| admin    | 1234 | Super Admin|
| manager  | 5678 | Manager    |
| cashier  | 1111 | Cashier    |
| cashier2 | 2222 | Cashier    |
| inventory| 3333 | Inventory  |

## Sample Barcodes

| Barcode      | Product            | Price (KES) |
|--------------|--------------------|-------------|
| 6161100100011| Fresh Milk 500ml   | 85          |
| 6161100300028| Coca-Cola 500ml    | 80          |
| 6161100600011| White Bread 400g   | 65          |
| 6161100700011| Pishori Rice 2kg   | 350         |
| 6161100400011| Simba Chips 100g   | 120         |
