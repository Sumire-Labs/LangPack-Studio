import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import path from 'node:path'
import { promises as fs } from 'node:fs'

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
    icon: process.env.VITE_PUBLIC ? path.join(process.env.VITE_PUBLIC, 'icon.png') : undefined,
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
  if (!mainWindow) {
    console.error('Main window is not available')
    return []
  }

  try {
    const result = await dialog.showOpenDialog(mainWindow, {
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
  } catch (error) {
    console.error('Error opening file dialog:', error)
    return []
  }
})

ipcMain.handle('save-resource-pack', async (_, resourcePackData: any, fileName?: string) => {
  if (!mainWindow) {
    console.error('Main window is not available')
    return null
  }

  try {
    // packNameが提供されている場合は、それを使用してファイル名を生成
    let defaultFileName = 'resource-pack.zip'
    if (fileName) {
      // ファイル名をサニタイズ（クロスプラットフォーム対応）
      let sanitizedName = fileName
        // Windowsで無効な文字を置換
        .replace(/[<>:"/\\|?*]/g, '_')  
        // 制御文字を除去
        .replace(/[\x00-\x1f]/g, '_')   
        // 連続するスペースを単一のハイフンに
        .replace(/\s+/g, '_')           
        // 連続するアンダースコア/ハイフンを単一に
        .replace(/[-_]+/g, '_')         
        // 先頭末尾の特殊文字を除去
        .replace(/^[._-]+|[._-]+$/g, '') 
        // 最大長制限（255文字だが余裕を持って200文字）
        .substring(0, 200)
        .trim()
      
      // 空の文字列や予約語をチェック
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
      if (!sanitizedName || reservedNames.includes(sanitizedName.toUpperCase())) {
        sanitizedName = 'resource-pack'
      }
      
      defaultFileName = `${sanitizedName}.zip`
      console.log(`Original filename: "${fileName}" -> Sanitized: "${sanitizedName}"`)
    }

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultFileName,
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
  } catch (error) {
    console.error('Error saving resource pack:', error)
    return null
  }
})