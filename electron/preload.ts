import { contextBridge, ipcRenderer } from 'electron'

export interface LanguageFile {
  path: string
  name: string
  content: string
}

export interface ElectronAPI {
  selectFiles: () => Promise<LanguageFile[]>
  saveResourcePack: (data: Buffer) => Promise<string | null>
}

const electronAPI: ElectronAPI = {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  saveResourcePack: (data: Buffer) => ipcRenderer.invoke('save-resource-pack', data)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)