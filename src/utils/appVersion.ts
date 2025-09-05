// App version utility
// This file provides version information from package.json

// For Vite builds, we need to define the version at build time
// This is handled by Vite's define config
export const APP_VERSION = __APP_VERSION__ || '1.3.1'
export const APP_NAME = 'LangPack Studio'

export const getVersionInfo = () => {
  return {
    version: APP_VERSION,
    name: APP_NAME,
    fullName: `${APP_NAME} v${APP_VERSION}`,
    buildDate: __BUILD_DATE__ || new Date().toISOString().split('T')[0]
  }
}