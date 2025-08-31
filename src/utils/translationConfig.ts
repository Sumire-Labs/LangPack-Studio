// Translation service configuration
export interface TranslationConfig {
  service: 'google' | 'deepl' | 'azure' | 'libretranslate' | 'openai'
  apiKey?: string
  apiUrl?: string
  region?: string // For Azure
  model?: string  // For OpenAI
}

// Load configuration from environment or localStorage
export class TranslationConfigManager {
  private static CONFIG_KEY = 'langpack_translation_config'

  static getConfig(): TranslationConfig | null {
    try {
      // Try environment variables first (for Electron)
      if (typeof process !== 'undefined' && process.env) {
        const service = process.env.TRANSLATION_SERVICE as any
        const apiKey = process.env.TRANSLATION_API_KEY
        
        if (service) {
          return {
            service,
            apiKey,
            apiUrl: process.env.TRANSLATION_API_URL,
            region: process.env.TRANSLATION_REGION,
            model: process.env.TRANSLATION_MODEL
          }
        }
      }

      // Try localStorage
      const stored = localStorage.getItem(this.CONFIG_KEY)
      if (stored) {
        return JSON.parse(stored)
      }

      return null
    } catch (error) {
      console.error('Failed to load translation config:', error)
      return null
    }
  }

  static saveConfig(config: TranslationConfig): boolean {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config))
      return true
    } catch (error) {
      console.error('Failed to save translation config:', error)
      return false
    }
  }

  static clearConfig(): void {
    localStorage.removeItem(this.CONFIG_KEY)
  }

  static validateApiKey(service: string, apiKey: string): boolean {
    switch (service) {
      case 'google':
        // Google API key format: AIza...
        return apiKey.startsWith('AIza') && apiKey.length > 30
      
      case 'deepl':
        // DeepL API key format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
        return apiKey.includes('-') && apiKey.length > 30
      
      case 'azure':
        // Azure key format: 32 character hex string
        return /^[a-f0-9]{32}$/i.test(apiKey)
      
      case 'openai':
        // OpenAI API key format: sk-...
        return apiKey.startsWith('sk-') && apiKey.length > 40
      
      default:
        return true // No validation for custom services
    }
  }
}