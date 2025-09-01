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
  selectFiles: async () => {
    try {
      console.log('Preload: selectFiles called')
      const result = await ipcRenderer.invoke('select-files')
      console.log('Preload: selectFiles result:', result)
      return result
    } catch (error) {
      console.error('Preload: selectFiles error:', error)
      return []
    }
  },
  saveResourcePack: async (data: Buffer) => {
    try {
      console.log('Preload: saveResourcePack called')
      const result = await ipcRenderer.invoke('save-resource-pack', data)
      console.log('Preload: saveResourcePack result:', result)
      return result
    } catch (error) {
      console.error('Preload: saveResourcePack error:', error)
      return null
    }
  }
}

console.log('Preload: Exposing electronAPI to main world')
contextBridge.exposeInMainWorld('electronAPI', electronAPI)
console.log('Preload: electronAPI exposed successfully')