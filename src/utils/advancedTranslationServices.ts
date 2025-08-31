import { TranslationRequest, TranslationResult, BatchTranslationRequest, BatchTranslationResult } from './translationService'

// DeepL Translation Service
export class DeepLService {
  private apiKey: string
  private apiUrl: string

  constructor(apiKey: string, useFreeApi = false) {
    this.apiKey = apiKey
    this.apiUrl = useFreeApi 
      ? 'https://api-free.deepl.com/v2/translate'
      : 'https://api.deepl.com/v2/translate'
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const params = new URLSearchParams({
      auth_key: this.apiKey,
      text: request.text,
      source_lang: request.from.toUpperCase(),
      target_lang: request.to.toUpperCase()
    })

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      originalText: request.text,
      translatedText: data.translations[0].text,
      from: request.from,
      to: request.to
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
    
    // DeepL supports multiple texts in one request
    const batchSize = 50 // DeepL limit
    for (let i = 0; i < request.entries.length; i += batchSize) {
      const batch = request.entries.slice(i, Math.min(i + batchSize, request.entries.length))
      
      try {
        const texts = batch.map(e => e.text)
        const params = new URLSearchParams({
          auth_key: this.apiKey,
          source_lang: request.from.toUpperCase(),
          target_lang: request.to.toUpperCase()
        })
        
        texts.forEach(text => params.append('text', text))

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params
        })

        if (!response.ok) {
          throw new Error(`DeepL API error: ${response.status}`)
        }

        const data = await response.json()
        
        data.translations.forEach((translation: any, index: number) => {
          result.translations.push({
            key: batch[index].key,
            original: batch[index].text,
            translated: translation.text
          })
          result.totalProcessed++
        })
      } catch (error) {
        batch.forEach(entry => {
          result.failed.push({
            key: entry.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          result.totalFailed++
        })
      }

      const progress = ((Math.min(i + batchSize, request.entries.length)) / total) * 100
      onProgress?.(progress)
    }

    result.success = result.totalFailed < total
    return result
  }
}

// Azure Translator Service
export class AzureTranslatorService {
  private apiKey: string
  private endpoint: string
  private region: string

  constructor(apiKey: string, region = 'global', endpoint = 'https://api.cognitive.microsofttranslator.com') {
    this.apiKey = apiKey
    this.region = region
    this.endpoint = endpoint
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = `${this.endpoint}/translate?api-version=3.0&from=${request.from}&to=${request.to}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Ocp-Apim-Subscription-Region': this.region,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text: request.text }])
    })

    if (!response.ok) {
      throw new Error(`Azure Translator error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      originalText: request.text,
      translatedText: data[0].translations[0].text,
      from: request.from,
      to: request.to
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
    const batchSize = 100 // Azure limit
    
    for (let i = 0; i < request.entries.length; i += batchSize) {
      const batch = request.entries.slice(i, Math.min(i + batchSize, request.entries.length))
      
      try {
        const url = `${this.endpoint}/translate?api-version=3.0&from=${request.from}&to=${request.to}`
        const texts = batch.map(e => ({ text: e.text }))

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Ocp-Apim-Subscription-Region': this.region,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(texts)
        })

        if (!response.ok) {
          throw new Error(`Azure Translator error: ${response.status}`)
        }

        const data = await response.json()
        
        data.forEach((item: any, index: number) => {
          result.translations.push({
            key: batch[index].key,
            original: batch[index].text,
            translated: item.translations[0].text
          })
          result.totalProcessed++
        })
      } catch (error) {
        batch.forEach(entry => {
          result.failed.push({
            key: entry.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          result.totalFailed++
        })
      }

      const progress = ((Math.min(i + batchSize, request.entries.length)) / total) * 100
      onProgress?.(progress)
    }

    result.success = result.totalFailed < total
    return result
  }
}

// OpenAI Translation Service (using GPT models)
export class OpenAITranslatorService {
  private apiKey: string
  private model: string
  private apiUrl: string

  constructor(apiKey: string, model = 'gpt-3.5-turbo') {
    this.apiKey = apiKey
    this.model = model
    this.apiUrl = 'https://api.openai.com/v1/chat/completions'
  }

  private getSystemPrompt(from: string, to: string): string {
    return `You are a professional translator specializing in Minecraft mod translations. 
Translate the following text from ${from} to ${to}. 
Keep the following rules:
1. Preserve all formatting codes (like %s, %d, %%)
2. Keep technical terms consistent
3. Maintain the same tone and style
4. For Minecraft-specific terms, use commonly accepted translations
5. Return ONLY the translated text, no explanations`
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.from, request.to)
          },
          {
            role: 'user',
            content: request.text
          }
        ],
        temperature: 0.3 // Lower temperature for more consistent translations
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      originalText: request.text,
      translatedText: data.choices[0].message.content.trim(),
      from: request.from,
      to: request.to
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
    
    // Process in smaller batches to avoid token limits
    const batchSize = 10
    for (let i = 0; i < request.entries.length; i += batchSize) {
      const batch = request.entries.slice(i, Math.min(i + batchSize, request.entries.length))
      
      try {
        // Create a batch translation prompt
        const batchText = batch.map((e, idx) => `[${idx}] ${e.text}`).join('\n')
        
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'system',
                content: `${this.getSystemPrompt(request.from, request.to)}
Format your response as numbered lines matching the input format: [0] translation, [1] translation, etc.`
              },
              {
                role: 'user',
                content: batchText
              }
            ],
            temperature: 0.3
          })
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        const translatedText = data.choices[0].message.content.trim()
        
        // Parse the numbered responses
        const lines = translatedText.split('\n')
        lines.forEach(line => {
          const match = line.match(/\[(\d+)\]\s*(.+)/)
          if (match) {
            const index = parseInt(match[1])
            if (index < batch.length) {
              result.translations.push({
                key: batch[index].key,
                original: batch[index].text,
                translated: match[2].trim()
              })
              result.totalProcessed++
            }
          }
        })
      } catch (error) {
        batch.forEach(entry => {
          result.failed.push({
            key: entry.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          result.totalFailed++
        })
      }

      const progress = ((Math.min(i + batchSize, request.entries.length)) / total) * 100
      onProgress?.(progress)
      
      // Add delay to respect rate limits
      if (i + batchSize < request.entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    result.success = result.totalFailed < total
    return result
  }
}

// Google Cloud Translation API (official, requires API key)
export class GoogleCloudTranslateService {
  private apiKey: string
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const params = new URLSearchParams({
      key: this.apiKey,
      q: request.text,
      source: request.from,
      target: request.to,
      format: 'text'
    })

    const response = await fetch(`${this.apiUrl}?${params}`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`Google Cloud Translation error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      originalText: request.text,
      translatedText: data.data.translations[0].translatedText,
      from: request.from,
      to: request.to
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
    const batchSize = 100 // Google Cloud limit
    
    for (let i = 0; i < request.entries.length; i += batchSize) {
      const batch = request.entries.slice(i, Math.min(i + batchSize, request.entries.length))
      
      try {
        const params = new URLSearchParams({
          key: this.apiKey,
          source: request.from,
          target: request.to,
          format: 'text'
        })
        
        batch.forEach(entry => params.append('q', entry.text))

        const response = await fetch(`${this.apiUrl}?${params}`, {
          method: 'POST'
        })

        if (!response.ok) {
          throw new Error(`Google Cloud Translation error: ${response.status}`)
        }

        const data = await response.json()
        
        data.data.translations.forEach((translation: any, index: number) => {
          result.translations.push({
            key: batch[index].key,
            original: batch[index].text,
            translated: translation.translatedText
          })
          result.totalProcessed++
        })
      } catch (error) {
        batch.forEach(entry => {
          result.failed.push({
            key: entry.key,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          result.totalFailed++
        })
      }

      const progress = ((Math.min(i + batchSize, request.entries.length)) / total) * 100
      onProgress?.(progress)
    }

    result.success = result.totalFailed < total
    return result
  }
}