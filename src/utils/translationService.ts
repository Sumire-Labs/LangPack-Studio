export interface TranslationRequest {
  text: string
  from: string
  to: string
}

export interface TranslationResult {
  originalText: string
  translatedText: string
  from: string
  to: string
  confidence?: number
}

export interface BatchTranslationRequest {
  entries: { key: string; text: string }[]
  from: string
  to: string
}

export interface BatchTranslationResult {
  success: boolean
  translations: { key: string; original: string; translated: string; confidence?: number }[]
  failed: { key: string; error: string }[]
  totalProcessed: number
  totalFailed: number
}

// 無料のGoogle Translate API (非公式、制限あり)
class GoogleTranslateService {
  private baseUrl = 'https://translate.googleapis.com/translate_a/single'
  private requestQueue: Promise<any>[] = []
  private lastRequestTime = 0
  private minDelay = 100 // 100ms between requests to avoid rate limiting

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest(text: string, from: string, to: string): Promise<string> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.minDelay) {
      await this.delay(this.minDelay - timeSinceLastRequest)
    }

    this.lastRequestTime = Date.now()

    const params = new URLSearchParams({
      client: 'gtx',
      sl: from,
      tl: to,
      dt: 't',
      q: text
    })

    try {
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data[0] || !Array.isArray(data[0])) {
        throw new Error('Invalid translation response format')
      }

      // Extract translated text from response
      const translatedText = data[0]
        .map((item: any[]) => item[0])
        .join('')

      return translatedText || text
    } catch (error) {
      console.error('Translation error:', error)
      throw error
    }
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    try {
      const translatedText = await this.makeRequest(request.text, request.from, request.to)
      
      return {
        originalText: request.text,
        translatedText,
        from: request.from,
        to: request.to
      }
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    const result: BatchTranslationResult = {
      success: false,
      translations: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0
    }

    const total = request.entries.length
    
    for (let i = 0; i < request.entries.length; i++) {
      const entry = request.entries[i]
      
      try {
        const translationResult = await this.translate({
          text: entry.text,
          from: request.from,
          to: request.to
        })

        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated: translationResult.translatedText,
          confidence: translationResult.confidence
        })
        result.totalProcessed++
      } catch (error) {
        result.failed.push({
          key: entry.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        result.totalFailed++
      }

      // Report progress
      const progress = ((i + 1) / total) * 100
      onProgress?.(progress)
    }

    result.success = result.totalFailed < total
    return result
  }
}

// Alternative free translation service using LibreTranslate (if available)
class LibreTranslateService {
  private baseUrl: string

  constructor(apiUrl = 'https://libretranslate.de/translate') {
    this.baseUrl = apiUrl
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: request.text,
          source: request.from,
          target: request.to,
          format: 'text'
        })
      })

      if (!response.ok) {
        throw new Error(`LibreTranslate request failed: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        originalText: request.text,
        translatedText: data.translatedText || request.text,
        from: request.from,
        to: request.to
      }
    } catch (error) {
      throw new Error(`LibreTranslate failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    const result: BatchTranslationResult = {
      success: false,
      translations: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0
    }

    const total = request.entries.length
    
    for (let i = 0; i < request.entries.length; i++) {
      const entry = request.entries[i]
      
      try {
        const translationResult = await this.translate({
          text: entry.text,
          from: request.from,
          to: request.to
        })

        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated: translationResult.translatedText
        })
        result.totalProcessed++
      } catch (error) {
        result.failed.push({
          key: entry.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        result.totalFailed++
      }

      const progress = ((i + 1) / total) * 100
      onProgress?.(progress)

      // Add delay to avoid rate limiting
      if (i < request.entries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    result.success = result.totalFailed < total
    return result
  }
}

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' }
]

export type TranslationService = 'google' | 'libretranslate'

class TranslationManager {
  private googleService = new GoogleTranslateService()
  private libreTranslateService = new LibreTranslateService()
  private currentService: TranslationService = 'google'

  setService(service: TranslationService) {
    this.currentService = service
  }

  getCurrentService(): TranslationService {
    return this.currentService
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const service = this.currentService === 'google' ? this.googleService : this.libreTranslateService
    return await service.translate(request)
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    const service = this.currentService === 'google' ? this.googleService : this.libreTranslateService
    return await service.batchTranslate(request, onProgress)
  }

  async testService(service: TranslationService = this.currentService): Promise<boolean> {
    try {
      const testService = service === 'google' ? this.googleService : this.libreTranslateService
      await testService.translate({
        text: 'Hello',
        from: 'en',
        to: 'ja'
      })
      return true
    } catch (error) {
      console.error(`${service} service test failed:`, error)
      return false
    }
  }
}

export const translationManager = new TranslationManager()