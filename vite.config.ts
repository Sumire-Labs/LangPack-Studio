import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Read version from package.json
const packageJson = require('./package.json')

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0])
  },
  server: {
    port: 8080,
    host: '0.0.0.0'
  },
  preview: {
    port: 8080,  // LangPack Studio用
    host: '0.0.0.0',
    strictPort: true,
    // 外部アクセスを許可するホスト
    allowedHosts: [
      'pepeyukke.jp',
      'www.pepeyukke.jp',
      'app.pepeyukke.jp',  // LangPack Studio専用
      'langpack.pepeyukke.jp',  // 別名も可能
      'studio.pepeyukke.jp',    // お好みで
      '106.160.154.116',
      'localhost',
      '.pepeyukke.jp' // サブドメイン全て許可
    ]
  }
})