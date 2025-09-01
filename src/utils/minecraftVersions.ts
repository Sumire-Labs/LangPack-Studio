export interface MinecraftVersion {
  version: string
  packFormat: number
  displayName: string
  isRecommended?: boolean
}

export const MINECRAFT_VERSIONS: MinecraftVersion[] = [
  // 1.21系（最新）
  { version: '1.21.9-snapshot', packFormat: 65, displayName: 'Minecraft 1.21.9 Snapshot (25w31a-32a/The Copper Age)', isRecommended: false },
  { version: '1.21.7-1.21.8', packFormat: 64, displayName: 'Minecraft 1.21.7-1.21.8 (最新安定版)', isRecommended: true },
  { version: '1.21.6', packFormat: 63, displayName: 'Minecraft 1.21.6' },
  { version: '1.21.5', packFormat: 55, displayName: 'Minecraft 1.21.5' },
  { version: '1.21.4', packFormat: 46, displayName: 'Minecraft 1.21.4' },
  { version: '1.21.2-1.21.3', packFormat: 42, displayName: 'Minecraft 1.21.2-1.21.3' },
  { version: '1.21.0-1.21.1', packFormat: 34, displayName: 'Minecraft 1.21.0-1.21.1' },
  
  // 1.20系
  { version: '1.20.5-1.20.6', packFormat: 32, displayName: 'Minecraft 1.20.5-1.20.6' },
  { version: '1.20.3-1.20.4', packFormat: 22, displayName: 'Minecraft 1.20.3-1.20.4' },
  { version: '1.20.2', packFormat: 18, displayName: 'Minecraft 1.20.2' },
  { version: '1.20.0-1.20.1', packFormat: 15, displayName: 'Minecraft 1.20.0-1.20.1' },
  
  // 1.19系
  { version: '1.19.4', packFormat: 13, displayName: 'Minecraft 1.19.4' },
  { version: '1.19.3', packFormat: 12, displayName: 'Minecraft 1.19.3' },
  { version: '1.19.0-1.19.2', packFormat: 9, displayName: 'Minecraft 1.19.0-1.19.2' },
  
  // 1.18系
  { version: '1.18.2', packFormat: 8, displayName: 'Minecraft 1.18.2' },
  { version: '1.18.0-1.18.1', packFormat: 8, displayName: 'Minecraft 1.18.0-1.18.1' },
  
  // 1.17系
  { version: '1.17.0-1.17.1', packFormat: 7, displayName: 'Minecraft 1.17.0-1.17.1' },
  
  // 1.16系
  { version: '1.16.2-1.16.5', packFormat: 6, displayName: 'Minecraft 1.16.2-1.16.5' },
  { version: '1.16.0-1.16.1', packFormat: 5, displayName: 'Minecraft 1.16.0-1.16.1' },
  
  // 1.15系
  { version: '1.15.0-1.15.2', packFormat: 5, displayName: 'Minecraft 1.15.0-1.15.2' },
  
  // 1.14系
  { version: '1.14.0-1.14.4', packFormat: 4, displayName: 'Minecraft 1.14.0-1.14.4' },
  
  // 1.13系
  { version: '1.13.0-1.13.2', packFormat: 4, displayName: 'Minecraft 1.13.0-1.13.2' },
  
  // 1.12系（人気バージョン）
  { version: '1.12.2', packFormat: 3, displayName: 'Minecraft 1.12.2 (人気Mod対応)' },
  { version: '1.12.0-1.12.1', packFormat: 3, displayName: 'Minecraft 1.12.0-1.12.1' },
  
  // 1.11系
  { version: '1.11.2', packFormat: 3, displayName: 'Minecraft 1.11.2' },
  { version: '1.11.0-1.11.1', packFormat: 3, displayName: 'Minecraft 1.11.0-1.11.1' },
  
  // 1.10系
  { version: '1.10.2', packFormat: 2, displayName: 'Minecraft 1.10.2 (Mod対応)' },
  { version: '1.10.0-1.10.1', packFormat: 2, displayName: 'Minecraft 1.10.0-1.10.1' },
  
  // 1.9系
  { version: '1.9.4', packFormat: 2, displayName: 'Minecraft 1.9.4' },
  { version: '1.9.0-1.9.3', packFormat: 2, displayName: 'Minecraft 1.9.0-1.9.3' },
  
  // 1.8系（PvP人気）
  { version: '1.8.9', packFormat: 1, displayName: 'Minecraft 1.8.9 (PvP人気)' },
  { version: '1.8.0-1.8.8', packFormat: 1, displayName: 'Minecraft 1.8.0-1.8.8' },
  
  // 1.7系（黄金期）
  { version: '1.7.10', packFormat: 1, displayName: 'Minecraft 1.7.10 (Mod黄金期)' },
  { version: '1.7.2-1.7.9', packFormat: 1, displayName: 'Minecraft 1.7.2-1.7.9' },
  
  // 1.6系（馬アップデート）
  { version: '1.6.4', packFormat: 1, displayName: 'Minecraft 1.6.4' },
  { version: '1.6.1-1.6.2', packFormat: 1, displayName: 'Minecraft 1.6.1-1.6.2' },
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