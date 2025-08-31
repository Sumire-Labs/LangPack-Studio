export interface MinecraftVersion {
  version: string
  packFormat: number
  displayName: string
  isRecommended?: boolean
}

export const MINECRAFT_VERSIONS: MinecraftVersion[] = [
  // 最新バージョン（推奨）
  { version: '1.21.x', packFormat: 48, displayName: 'Minecraft 1.21.x (最新)', isRecommended: true },
  { version: '1.20.5-1.20.6', packFormat: 32, displayName: 'Minecraft 1.20.5-1.20.6' },
  { version: '1.20.3-1.20.4', packFormat: 26, displayName: 'Minecraft 1.20.3-1.20.4' },
  { version: '1.20.2', packFormat: 18, displayName: 'Minecraft 1.20.2' },
  { version: '1.20-1.20.1', packFormat: 15, displayName: 'Minecraft 1.20-1.20.1' },
  
  // 1.19.x系
  { version: '1.19.4', packFormat: 13, displayName: 'Minecraft 1.19.4' },
  { version: '1.19.3', packFormat: 12, displayName: 'Minecraft 1.19.3' },
  { version: '1.19-1.19.2', packFormat: 9, displayName: 'Minecraft 1.19-1.19.2' },
  
  // 1.18.x系
  { version: '1.18.2', packFormat: 8, displayName: 'Minecraft 1.18.2' },
  { version: '1.18-1.18.1', packFormat: 8, displayName: 'Minecraft 1.18-1.18.1' },
  
  // 1.17.x系
  { version: '1.17-1.17.1', packFormat: 7, displayName: 'Minecraft 1.17-1.17.1' },
  
  // 1.16.x系
  { version: '1.16.2-1.16.5', packFormat: 6, displayName: 'Minecraft 1.16.2-1.16.5' },
  { version: '1.16-1.16.1', packFormat: 5, displayName: 'Minecraft 1.16-1.16.1' },
  
  // 1.15.x系
  { version: '1.15-1.15.2', packFormat: 5, displayName: 'Minecraft 1.15-1.15.2' },
  
  // 1.14.x系
  { version: '1.14-1.14.4', packFormat: 4, displayName: 'Minecraft 1.14-1.14.4' },
  
  // 1.13.x系
  { version: '1.13-1.13.2', packFormat: 4, displayName: 'Minecraft 1.13-1.13.2' },
  
  // レガシー（.lang形式）
  { version: '1.12.x以前', packFormat: 3, displayName: 'Minecraft 1.12.x以前 (レガシー)' },
]

export const getVersionByPackFormat = (packFormat: number): MinecraftVersion | undefined => {
  return MINECRAFT_VERSIONS.find(v => v.packFormat === packFormat)
}

export const getRecommendedVersion = (): MinecraftVersion => {
  return MINECRAFT_VERSIONS.find(v => v.isRecommended) || MINECRAFT_VERSIONS[0]
}

export const getPackFormatHelperText = (packFormat: number): string => {
  const version = getVersionByPackFormat(packFormat)
  if (version) {
    return `${version.displayName} - パックフォーマット ${packFormat}`
  }
  return `カスタムパックフォーマット: ${packFormat}`
}