import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { promises as fs } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    title: 'LangPack Studio',
    show: false
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Language Files', extensions: ['json', 'lang'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled) {
    const fileContents = await Promise.all(
      result.filePaths.map(async (filePath) => {
        const content = await fs.readFile(filePath, 'utf-8')
        return {
          path: filePath,
          name: path.basename(filePath),
          content
        }
      })
    )
    return fileContents
  }
  
  return []
})

ipcMain.handle('save-resource-pack', async (_, resourcePackData: any) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: 'resource-pack.zip',
    filters: [
      { name: 'ZIP Files', extensions: ['zip'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled && result.filePath) {
    await fs.writeFile(result.filePath, resourcePackData)
    return result.filePath
  }
  
  return null
})