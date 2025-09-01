import { translationCache } from './translationCache'
import { ParallelTranslationProcessor } from './parallelProcessor'

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
  fromCache?: boolean
}

export interface BatchTranslationRequest {
  entries: { key: string; text: string }[]
  from: string
  to: string
}

export interface BatchTranslationResult {
  success: boolean
  translations: { key: string; original: string; translated: string; confidence?: number; fromCache?: boolean }[]
  failed: { key: string; error: string }[]
  totalProcessed: number
  totalFailed: number
  cacheHits?: number
  cacheMisses?: number
}

// 無料のGoogle Translate API (非公式、制限あり)
class GoogleTranslateService {
  private baseUrl = 'https://translate.googleapis.com/translate_a/single'
  private requestQueue: Promise<any>[] = []
  private lastRequestTime = 0
  private minDelay = 100 // 100ms between requests to avoid rate limiting
  private parallelProcessor = new ParallelTranslationProcessor(3, 200) // 最大3並列、200ms間隔

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
    // キャッシュチェック
    const cached = translationCache.get(request.text, request.from, request.to, 'google')
    if (cached) {
      return {
        originalText: request.text,
        translatedText: cached,
        from: request.from,
        to: request.to,
        fromCache: true
      }
    }

    try {
      const translatedText = await this.makeRequest(request.text, request.from, request.to)
      
      // キャッシュに保存
      translationCache.set(request.text, translatedText, request.from, request.to, 'google')
      
      return {
        originalText: request.text,
        translatedText,
        from: request.from,
        to: request.to,
        fromCache: false
      }
    } catch (error) {
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    console.log(`[Google] Starting batch translation of ${request.entries.length} entries`)
    
    // 並列翻訳を実行
    const translationResults = await this.parallelProcessor.translateSmartBatch(
      request.entries.map(entry => ({ text: entry.text, key: entry.key })),
      (text: string) => this.makeRequest(text, request.from, request.to),
      onProgress
    )

    const result: BatchTranslationResult = {
      success: true,
      translations: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0
    }

    // 結果を変換
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && translated !== entry.text) {
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        result.failed.push({
          key: entry.key,
          error: 'Translation failed or returned original text'
        })
        result.totalFailed++
      }
    }

    const stats = this.parallelProcessor.getStats()
    console.log(`[Google] Batch completed: ${stats.processed} processed, ${stats.failed} failed, ${stats.apiCalls} API calls`)

    result.success = result.totalFailed < request.entries.length / 2 // 半数以上成功すれば成功とみなす
    return result
  }
}

// Google Gemini AI translation service
class GeminiTranslateService {
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  private parallelProcessor = new ParallelTranslationProcessor(2, 1000) // 最大2並列、1秒間隔（Geminiは制限厳しい）

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private createTranslationPrompt(text: string, from: string, to: string): string {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'zh-TW': 'Chinese (Traditional)',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'it': 'Italian',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish'
    }

    const fromLang = languageNames[from] || from
    const toLang = languageNames[to] || to

    return `You are a professional translator specializing in Minecraft mod localization. Please translate the following text from ${fromLang} to ${toLang}.

IMPORTANT RULES:
- Provide ONLY the translated text, no explanations or additional content
- Preserve any Minecraft-specific terms (like "Creeper", "Redstone", etc.) appropriately
- Keep formatting characters like %s, %d, \${...} unchanged
- Maintain the same tone and style as the original
- For UI text, keep translations concise and appropriate for interface elements

Text to translate: "${text}"

Translation:`
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    // キャッシュチェック
    const cached = translationCache.get(request.text, request.from, request.to, 'gemini')
    if (cached) {
      return {
        originalText: request.text,
        translatedText: cached,
        from: request.from,
        to: request.to,
        confidence: 0.9,
        fromCache: true
      }
    }

    try {
      const prompt = this.createTranslationPrompt(request.text, request.from, request.to)
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid Gemini API response format')
      }

      let translatedText = data.candidates[0].content.parts[0].text.trim()
      
      // Clean up the response - remove any extra formatting or explanations
      translatedText = translatedText.replace(/^Translation:\s*/i, '')
      translatedText = translatedText.replace(/^["']|["']$/g, '') // Remove quotes if present
      
      // キャッシュに保存
      translationCache.set(request.text, translatedText || request.text, request.from, request.to, 'gemini')
      
      return {
        originalText: request.text,
        translatedText: translatedText || request.text,
        from: request.from,
        to: request.to,
        confidence: 0.9, // Gemini typically provides high quality translations
        fromCache: false
      }
    } catch (error) {
      throw new Error(`Gemini translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    console.log(`[Gemini] Starting batch translation of ${request.entries.length} entries`)
    
    // Gemini用の翻訳関数を定義
    const geminiTranslator = async (text: string): Promise<string> => {
      const prompt = this.createTranslationPrompt(text, request.from, request.to)
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid Gemini API response format')
      }

      let translatedText = data.candidates[0].content.parts[0].text.trim()
      translatedText = translatedText.replace(/^Translation:\\s*/i, '')
      translatedText = translatedText.replace(/^[\"']|[\"']$/g, '')
      
      return translatedText || text
    }

    // 並列翻訳を実行
    const translationResults = await this.parallelProcessor.translateSmartBatch(
      request.entries.map(entry => ({ text: entry.text, key: entry.key })),
      geminiTranslator,
      onProgress
    )

    const result: BatchTranslationResult = {
      success: true,
      translations: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0
    }

    // 結果を変換
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && translated !== entry.text) {
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated,
          confidence: 0.9,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        result.failed.push({
          key: entry.key,
          error: 'Translation failed or returned original text'
        })
        result.totalFailed++
      }
    }

    const stats = this.parallelProcessor.getStats()
    console.log(`[Gemini] Batch completed: ${stats.processed} processed, ${stats.failed} failed, ${stats.apiCalls} API calls`)

    result.success = result.totalFailed < request.entries.length / 2
    return result
  }
}

// Alternative free translation service using LibreTranslate (if available)
class LibreTranslateService {
  private baseUrl: string
  private parallelProcessor = new ParallelTranslationProcessor(2, 500) // 最大2並列、500ms間隔

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
    console.log(`[LibreTranslate] Starting batch translation of ${request.entries.length} entries`)
    
    // LibreTranslate用の翻訳関数を定義
    const libreTranslator = async (text: string): Promise<string> => {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: request.from,
          target: request.to,
          format: 'text'
        })
      })

      if (!response.ok) {
        throw new Error(`LibreTranslate request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.translatedText || text
    }

    // 並列翻訳を実行
    const translationResults = await this.parallelProcessor.translateSmartBatch(
      request.entries.map(entry => ({ text: entry.text, key: entry.key })),
      libreTranslator,
      onProgress
    )

    const result: BatchTranslationResult = {
      success: true,
      translations: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0
    }

    // 結果を変換
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && translated !== entry.text) {
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        result.failed.push({
          key: entry.key,
          error: 'Translation failed or returned original text'
        })
        result.totalFailed++
      }
    }

    const stats = this.parallelProcessor.getStats()
    console.log(`[LibreTranslate] Batch completed: ${stats.processed} processed, ${stats.failed} failed, ${stats.apiCalls} API calls`)

    result.success = result.totalFailed < request.entries.length / 2
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

export type TranslationService = 'google' | 'gemini' | 'libretranslate'

class TranslationManager {
  private googleService = new GoogleTranslateService()
  private libreTranslateService = new LibreTranslateService()
  private geminiService: GeminiTranslateService | null = null
  private currentService: TranslationService = 'google'
  private geminiApiKey: string = ''

  setService(service: TranslationService) {
    this.currentService = service
  }

  setGeminiApiKey(apiKey: string) {
    this.geminiApiKey = apiKey
    this.geminiService = apiKey ? new GeminiTranslateService(apiKey) : null
  }

  getCurrentService(): TranslationService {
    return this.currentService
  }

  private getService() {
    switch (this.currentService) {
      case 'google':
        return this.googleService
      case 'gemini':
        if (!this.geminiService) {
          throw new Error('Gemini API key not set. Please configure your API key first.')
        }
        return this.geminiService
      case 'libretranslate':
        return this.libreTranslateService
      default:
        return this.googleService
    }
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const service = this.getService()
    return await service.translate(request)
  }

  async batchTranslate(request: BatchTranslationRequest, onProgress?: (progress: number) => void): Promise<BatchTranslationResult> {
    const service = this.getService()
    return await service.batchTranslate(request, onProgress)
  }

  async testService(service: TranslationService = this.currentService): Promise<boolean> {
    try {
      let testService
      switch (service) {
        case 'google':
          testService = this.googleService
          break
        case 'gemini':
          if (!this.geminiService) {
            return false
          }
          testService = this.geminiService
          break
        case 'libretranslate':
          testService = this.libreTranslateService
          break
        default:
          return false
      }
      
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