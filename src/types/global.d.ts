export interface LanguageFile {
  path: string
  name: string
  content: string
}

export interface ElectronAPI {
  selectFiles: () => Promise<LanguageFile[]>
  saveResourcePack: (data: Buffer) => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}