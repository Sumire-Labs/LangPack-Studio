import { translationCache } from './translationCache'
import { ParallelTranslationProcessor, createAdaptiveParallelProcessor } from './parallelProcessor'

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
  private lastRequestTime = 0
  private minDelay = 100 // 100ms between requests to avoid rate limiting
  private parallelProcessor = createAdaptiveParallelProcessor('google', 3, 200) // アダプティブ並列処理

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

    // 結果を変換（Google Translate用）
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && typeof translated === 'object' && 'error' in translated) {
        // エラーの場合
        result.failed.push({
          key: entry.key,
          error: translated.error
        })
        result.totalFailed++
      } else if (translated && translated !== entry.text) {
        // 翻訳成功
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated: translated as string,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        // 翻訳されなかった（元のテキストと同じ）
        result.failed.push({
          key: entry.key,
          error: '翻訳されませんでした（元のテキストと同じ結果）'
        })
        result.totalFailed++
      }
    }

    result.success = result.totalFailed < request.entries.length / 2 // 半数以上成功すれば成功とみなす
    return result
  }
}

// Google Gemini AI translation service
class GeminiTranslateService {
  private apiKey: string
  private modelName: string
  private parallelProcessor = createAdaptiveParallelProcessor('gemini', 5, 300) // Gemini 2.0アダプティブ処理

  // 使用可能なGeminiモデル
  private static readonly AVAILABLE_MODELS = {
    'gemini-2.0-flash': 'Gemini 2.0 Flash (最新・推奨)',
    'gemini-2.0-flash-lite': 'Gemini 2.0 Flash-Lite (高速・低コスト)',
    'gemini-2.0-flash-001': 'Gemini 2.0 Flash (安定版)',
    'gemini-2.0-flash-lite-001': 'Gemini 2.0 Flash-Lite (安定版)',
    'gemini-1.5-flash-latest': 'Gemini 1.5 Flash (レガシー)',
    'gemini-1.5-pro-latest': 'Gemini 1.5 Pro (レガシー)'
  }

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    this.apiKey = apiKey
    this.modelName = modelName
    
    // APIキーの形式をチェック
    if (!apiKey) {
      console.warn('[Gemini] API key is empty')
    } else if (!apiKey.startsWith('AIza')) {
      console.warn('[Gemini] API key format may be incorrect (should start with AIza)')
    } else {
      console.log('[Gemini] API key format looks correct')
    }
    
    // 使用モデルをログ出力
    const modelDescription = GeminiTranslateService.AVAILABLE_MODELS[modelName as keyof typeof GeminiTranslateService.AVAILABLE_MODELS]
    console.log(`[Gemini] Using model: ${modelName} (${modelDescription || 'Unknown model'})`)
  }

  /**
   * 使用可能なモデル一覧を取得
   */
  static getAvailableModels() {
    return GeminiTranslateService.AVAILABLE_MODELS
  }

  /**
   * モデルを変更
   */
  setModel(modelName: string) {
    if (modelName in GeminiTranslateService.AVAILABLE_MODELS) {
      this.modelName = modelName
      console.log(`[Gemini] Model changed to: ${modelName}`)
    } else {
      console.warn(`[Gemini] Unknown model: ${modelName}`)
    }
  }

  /**
   * 現在のAPIエンドポイントを取得
   */
  private getApiUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`
  }

  /**
   * APIキーと接続をテスト
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('[Gemini] Testing API connection...')
      const testResult = await this.translate({
        text: 'Hello',
        from: 'en',
        to: 'ja'
      })
      console.log('[Gemini] Connection test successful:', testResult.translatedText)
      return true
    } catch (error) {
      console.error('[Gemini] Connection test failed:', error)
      return false
    }
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
      
      console.log('[Gemini Debug] API Key length:', this.apiKey ? this.apiKey.length : 'Not set')
      const apiUrl = this.getApiUrl()
      console.log('[Gemini Debug] Request URL:', `${apiUrl}?key=${this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'NOT_SET'}`)
      console.log('[Gemini Debug] Text to translate:', request.text.substring(0, 50) + '...')
      console.log('[Gemini Debug] Using model:', this.modelName)
      
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000, // Gemini 2.0は最大8192まで対応
          topP: 0.8,
          topK: 40
        }
      }
      
      console.log('[Gemini Debug] Request body:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('[Gemini Debug] Response status:', response.status)
      console.log('[Gemini Debug] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Gemini Debug] Error response body:', errorText)
        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          console.error('[Gemini Debug] Could not parse error as JSON')
        }
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || errorText || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('[Gemini Debug] Response data:', JSON.stringify(data, null, 2))
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('[Gemini Debug] Invalid response structure:', data)
        throw new Error('Invalid Gemini API response format')
      }

      let translatedText = data.candidates[0].content.parts[0].text.trim()
      console.log('[Gemini Debug] Raw translated text:', translatedText)
      
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
      const apiUrl = this.getApiUrl()
      
      const response = await fetch(`${apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2000, // Gemini 2.0対応
            topP: 0.8,
            topK: 40
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

    // 結果を変換（Gemini用）
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && typeof translated === 'object' && 'error' in translated) {
        // エラーの場合
        result.failed.push({
          key: entry.key,
          error: translated.error
        })
        result.totalFailed++
      } else if (translated && translated !== entry.text) {
        // 翻訳成功
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated: translated as string,
          confidence: 0.9,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        // 翻訳されなかった（元のテキストと同じ）
        result.failed.push({
          key: entry.key,
          error: '翻訳されませんでした（元のテキストと同じ結果）'
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
  private parallelProcessor = createAdaptiveParallelProcessor('libretranslate', 2, 500) // LibreTranslateアダプティブ処理

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

    // 結果を変換（LibreTranslate用）
    for (const entry of request.entries) {
      const translated = translationResults.get(entry.key)
      if (translated && typeof translated === 'object' && 'error' in translated) {
        // エラーの場合
        result.failed.push({
          key: entry.key,
          error: translated.error
        })
        result.totalFailed++
      } else if (translated && translated !== entry.text) {
        // 翻訳成功
        result.translations.push({
          key: entry.key,
          original: entry.text,
          translated: translated as string,
          fromCache: false
        })
        result.totalProcessed++
      } else {
        // 翻訳されなかった（元のテキストと同じ）
        result.failed.push({
          key: entry.key,
          error: '翻訳されませんでした（元のテキストと同じ結果）'
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

  setService(service: TranslationService) {
    this.currentService = service
  }

  setGeminiApiKey(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    this.geminiService = apiKey ? new GeminiTranslateService(apiKey, modelName) : null
    // APIキー設定後に接続テストを実行
    if (this.geminiService) {
      setTimeout(() => {
        this.geminiService?.testConnection()
      }, 1000)
    }
  }

  /**
   * Geminiモデルを変更
   */
  setGeminiModel(modelName: string) {
    if (this.geminiService) {
      this.geminiService.setModel(modelName)
    } else {
      console.warn('[TranslationManager] Gemini service not initialized')
    }
  }

  /**
   * 使用可能なGeminiモデル一覧を取得
   */
  getAvailableGeminiModels() {
    return GeminiTranslateService.getAvailableModels()
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