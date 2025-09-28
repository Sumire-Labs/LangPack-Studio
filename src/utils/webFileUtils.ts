import { LanguageFile } from '../types/global'

export const selectFiles = (): Promise<LanguageFile[]> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.json,.lang'

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement
      const files = target.files

      if (!files || files.length === 0) {
        resolve([])
        return
      }

      const languageFiles: LanguageFile[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const content = await file.text()
          languageFiles.push({
            path: file.name,
            name: file.name,
            content
          })
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error)
        }
      }

      resolve(languageFiles)
    }

    input.oncancel = () => {
      resolve([])
    }

    input.click()
  })
}

export const downloadFile = (data: Uint8Array | string, fileName: string, mimeType: string = 'application/octet-stream') => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export const saveResourcePack = async (data: Buffer | Uint8Array, fileName?: string): Promise<string | null> => {
  try {
    const finalFileName = fileName || 'resource-pack.zip'
    downloadFile(data, finalFileName, 'application/zip')
    return finalFileName
  } catch (error) {
    console.error('Error saving resource pack:', error)
    return null
  }
}