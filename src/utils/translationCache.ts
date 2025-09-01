/**
 * Translation Cache System for Performance Optimization
 * キャッシュシステムによる翻訳パフォーマンスの最適化
 */

export interface CacheEntry {
  originalText: string
  translatedText: string
  fromLang: string
  toLang: string
  timestamp: number
  hitCount: number
  service?: string
}

export interface CacheStats {
  totalEntries: number
  totalHits: number
  hitRate: number
  memoryUsage: number
  oldestEntry: Date | null
  mostUsedEntry: { text: string; count: number } | null
}

export class TranslationCache {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private readonly MAX_MEMORY_ENTRIES = 1000
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly TTL = 24 * 60 * 60 * 1000 // 24時間
  private readonly STORAGE_KEY = 'langpack_translation_cache'
  private totalHits = 0
  private totalMisses = 0

  constructor() {
    this.loadFromStorage()
    this.startCleanupTimer()
  }

  /**
   * キャッシュキーの生成
   */
  private getCacheKey(text: string, from: string, to: string, service?: string): string {
    const serviceKey = service || 'default'
    return `${serviceKey}:${from}:${to}:${text.substring(0, 50)}`
  }

  /**
   * キャッシュから翻訳を取得
   */
  get(text: string, from: string, to: string, service?: string): string | null {
    const key = this.getCacheKey(text, from, to, service)
    const entry = this.memoryCache.get(key)

    if (!entry) {
      this.totalMisses++
      return null
    }

    // 有効期限チェック
    if (Date.now() - entry.timestamp > this.TTL) {
      this.memoryCache.delete(key)
      this.totalMisses++
      return null
    }

    // ヒット数を増やす
    entry.hitCount++
    this.totalHits++
    
    // LRU更新（最近使用したものを記録）
    entry.timestamp = Date.now()
    
    console.log(`[Cache HIT] ${text.substring(0, 30)}... (${this.getHitRate().toFixed(1)}% hit rate)`)
    
    return entry.translatedText
  }

  /**
   * キャッシュに翻訳を保存
   */
  set(
    text: string, 
    translated: string, 
    from: string, 
    to: string, 
    service?: string
  ): void {
    const key = this.getCacheKey(text, from, to, service)

    // メモリキャッシュサイズ制限
    if (this.memoryCache.size >= this.MAX_MEMORY_ENTRIES) {
      this.evictLeastUsed()
    }

    const entry: CacheEntry = {
      originalText: text,
      translatedText: translated,
      fromLang: from,
      toLang: to,
      timestamp: Date.now(),
      hitCount: 0,
      service
    }

    this.memoryCache.set(key, entry)
    
    // 定期的にストレージに保存（デバウンス）
    this.scheduleSaveToStorage()
  }

  /**
   * 複数の翻訳を一括チェック
   */
  getMany(
    entries: Array<{ text: string; from: string; to: string }>,
    service?: string
  ): Map<string, string | null> {
    const results = new Map<string, string | null>()
    
    entries.forEach(entry => {
      const key = `${entry.text}:${entry.from}:${entry.to}`
      const cached = this.get(entry.text, entry.from, entry.to, service)
      results.set(key, cached)
    })

    return results
  }

  /**
   * 最も使用されていないエントリを削除（LRU）
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null
    let leastUsedTime = Date.now()
    let leastHitCount = Infinity

    this.memoryCache.forEach((entry, key) => {
      // ヒット数と最終使用時刻を組み合わせて判断
      const score = entry.hitCount * 1000 + (Date.now() - entry.timestamp)
      const currentScore = leastHitCount * 1000 + (Date.now() - leastUsedTime)
      
      if (score < currentScore) {
        leastUsedKey = key
        leastUsedTime = entry.timestamp
        leastHitCount = entry.hitCount
      }
    })

    if (leastUsedKey) {
      console.log(`[Cache] Evicting least used entry: ${leastUsedKey}`)
      this.memoryCache.delete(leastUsedKey)
    }
  }

  /**
   * LocalStorageから読み込み
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      if (!data) return

      const parsed = JSON.parse(data) as Record<string, CacheEntry>
      const now = Date.now()
      let loaded = 0

      Object.entries(parsed).forEach(([key, entry]) => {
        // 有効期限内のエントリのみ読み込み
        if (now - entry.timestamp < this.TTL) {
          this.memoryCache.set(key, entry)
          loaded++
        }
      })

      console.log(`[Cache] Loaded ${loaded} entries from storage`)
    } catch (error) {
      console.error('[Cache] Failed to load from storage:', error)
    }
  }

  /**
   * LocalStorageに保存（デバウンス付き）
   */
  private saveTimer: NodeJS.Timeout | null = null
  
  private scheduleSaveToStorage(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }

    this.saveTimer = setTimeout(() => {
      this.saveToStorage()
    }, 5000) // 5秒後に保存
  }

  private saveToStorage(): void {
    try {
      const data: Record<string, CacheEntry> = {}
      
      // メモリキャッシュをオブジェクトに変換
      this.memoryCache.forEach((entry, key) => {
        data[key] = entry
      })

      const serialized = JSON.stringify(data)
      
      // サイズチェック
      if (serialized.length > this.MAX_STORAGE_SIZE) {
        console.warn('[Cache] Storage size limit exceeded, clearing old entries')
        this.clearOldEntries()
        return
      }

      localStorage.setItem(this.STORAGE_KEY, serialized)
      console.log(`[Cache] Saved ${this.memoryCache.size} entries to storage`)
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('[Cache] Storage quota exceeded, clearing cache')
        this.clear()
      } else {
        console.error('[Cache] Failed to save to storage:', error)
      }
    }
  }

  /**
   * 古いエントリを削除
   */
  private clearOldEntries(): void {
    const now = Date.now()
    const cutoff = now - (this.TTL / 2) // TTLの半分より古いものを削除

    this.memoryCache.forEach((entry, key) => {
      if (now - entry.timestamp > cutoff) {
        this.memoryCache.delete(key)
      }
    })

    this.saveToStorage()
  }

  /**
   * 定期的なクリーンアップ
   */
  private cleanupTimer: NodeJS.Timeout | null = null

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.clearOldEntries()
    }, 60 * 60 * 1000) as any // 1時間ごと
  }

  /**
   * キャッシュ統計を取得
   */
  getStats(): CacheStats {
    let oldestTime = Date.now()
    let mostUsedEntry: { text: string; count: number } | null = null
    let totalSize = 0

    this.memoryCache.forEach(entry => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
      }

      if (!mostUsedEntry || entry.hitCount > mostUsedEntry.count) {
        mostUsedEntry = {
          text: entry.originalText.substring(0, 50),
          count: entry.hitCount
        }
      }

      // 概算サイズ計算
      totalSize += entry.originalText.length + entry.translatedText.length
    })

    return {
      totalEntries: this.memoryCache.size,
      totalHits: this.totalHits,
      hitRate: this.getHitRate(),
      memoryUsage: totalSize,
      oldestEntry: oldestTime < Date.now() ? new Date(oldestTime) : null,
      mostUsedEntry
    }
  }

  /**
   * ヒット率を取得
   */
  getHitRate(): number {
    const total = this.totalHits + this.totalMisses
    if (total === 0) return 0
    return (this.totalHits / total) * 100
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.memoryCache.clear()
    this.totalHits = 0
    this.totalMisses = 0
    
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('[Cache] Failed to clear storage:', error)
    }
    
    console.log('[Cache] Cache cleared')
  }

  /**
   * デバッグ情報を表示
   */
  debug(): void {
    const stats = this.getStats()
    console.group('[Cache Debug Info]')
    console.log('Total Entries:', stats.totalEntries)
    console.log('Total Hits:', stats.totalHits)
    console.log('Hit Rate:', `${stats.hitRate.toFixed(2)}%`)
    console.log('Memory Usage:', `${(stats.memoryUsage / 1024).toFixed(2)} KB`)
    console.log('Oldest Entry:', stats.oldestEntry)
    console.log('Most Used:', stats.mostUsedEntry)
    console.groupEnd()
  }

  /**
   * クリーンアップ（アプリ終了時）
   */
  dispose(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.saveToStorage()
  }
}

// シングルトンインスタンス
export const translationCache = new TranslationCache()

// ウィンドウ終了時に保存
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    translationCache.dispose()
  })
}