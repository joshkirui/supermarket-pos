const { app, BrowserWindow, Menu, dialog, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let backendProcess

const BACKEND_PORT = 3001
const isDev = !app.isPackaged

function startBackend() {
  if (!isDev) return

  const backendPath = path.join(__dirname, '..', '..', 'dist', 'main.js')
  backendProcess = spawn('node', [backendPath], {
    cwd: path.join(__dirname, '..', '..'),
    env: { ...process.env, PORT: BACKEND_PORT, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/pos_db', JWT_SECRET: 'pos-super-secret-key-2026' },
    stdio: 'inherit',
  })

  backendProcess.on('error', (err) => {
    console.error('Backend failed to start:', err.message)
  })

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      dialog.showErrorBox('Backend Error', 'The backend server failed to start. Make sure PostgreSQL is running.')
    }
  })
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill()
    backendProcess = null
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'POS System - Kenyan Supermarket',
    backgroundColor: '#f8fafc',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    show: false,
  })

  Menu.setApplicationMenu(null)

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (backendProcess) {
      e.preventDefault()
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Stop & Exit', 'Cancel'],
        defaultId: 0,
        title: 'Quit POS System',
        message: 'Stop the backend server and exit?',
      }).then(({ response }) => {
        if (response === 0) {
          stopBackend()
          mainWindow.destroy()
        }
      })
    }
  })
}

app.whenReady().then(() => {
  startBackend()

  // Give backend a moment to start
  setTimeout(() => {
    createWindow()
  }, isDev ? 2000 : 0)
})

app.on('window-all-closed', () => {
  stopBackend()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
  stopBackend()
})
