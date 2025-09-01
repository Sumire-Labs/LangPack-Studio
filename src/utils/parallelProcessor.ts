/**
 * Parallel Processing System for Optimized Translation
 * 並列処理による翻訳の最適化
 */

export interface QueueItem<T> {
  fn: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: any) => void
  priority?: number
}

/**
 * Promise Pool - 並列実行数を制限しながら効率的に処理
 */
export class PromisePool {
  private running = 0
  private queue: QueueItem<any>[] = []
  
  constructor(
    private maxConcurrent: number = 5,
    private rateLimitMs: number = 0
  ) {}

  /**
   * タスクを追加して実行
   */
  async add<T>(fn: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, priority })
      this.processNext()
    })
  }

  /**
   * 複数のタスクを並列実行
   */
  async addAll<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    const promises = tasks.map((task, index) => 
      this.add(task, tasks.length - index) // 優先度は逆順（最初のものを優先）
    )
    return Promise.all(promises)
  }

  /**
   * 次のタスクを処理
   */
  private async processNext(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    // 優先度でソート
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    const item = this.queue.shift()
    if (!item) return

    this.running++

    try {
      // レート制限
      if (this.rateLimitMs > 0) {
        await this.delay(this.rateLimitMs)
      }

      const result = await item.fn()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.running--
      this.processNext() // 次のタスクを処理
    }
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 現在の状態を取得
   */
  getStatus(): { running: number; queued: number } {
    return {
      running: this.running,
      queued: this.queue.length
    }
  }

  /**
   * すべてのタスクが完了するまで待機
   */
  async waitForAll(): Promise<void> {
    while (this.running > 0 || this.queue.length > 0) {
      await this.delay(100)
    }
  }
}

/**
 * Batch Processor - 効率的なバッチ処理
 */
export class BatchProcessor<T, R> {
  constructor(
    private batchSize: number = 10,
    private processor: (batch: T[]) => Promise<R[]>
  ) {}

  /**
   * アイテムをバッチ処理
   */
  async process(
    items: T[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    const results: R[] = []
    const batches = this.createBatches(items)
    let completed = 0

    for (const batch of batches) {
      const batchResults = await this.processor(batch)
      results.push(...batchResults)
      
      completed += batch.length
      onProgress?.(completed, items.length)
    }

    return results
  }

  /**
   * 並列バッチ処理
   */
  async processParallel(
    items: T[],
    maxConcurrent: number = 3,
    onProgress?: (completed: number, total: number) => void
  ): Promise<R[]> {
    const batches = this.createBatches(items)
    const pool = new PromisePool(maxConcurrent)
    const results: R[][] = []
    let completed = 0

    const promises = batches.map((batch, index) => 
      pool.add(async () => {
        const batchResults = await this.processor(batch)
        results[index] = batchResults
        
        completed += batch.length
        onProgress?.(completed, items.length)
        
        return batchResults
      })
    )

    await Promise.all(promises)
    
    // 結果を平坦化
    return results.flat()
  }

  /**
   * バッチを作成
   */
  private createBatches(items: T[]): T[][] {
    const batches: T[][] = []
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      batches.push(items.slice(i, i + this.batchSize))
    }
    
    return batches
  }
}

/**
 * Parallel Translation Processor - 翻訳専用の並列処理
 */
export class ParallelTranslationProcessor {
  private pool: PromisePool
  private stats = {
    processed: 0,
    failed: 0,
    cached: 0,
    apiCalls: 0
  }

  constructor(
    private maxConcurrent: number = 5,
    private rateLimitMs: number = 200 // デフォルト200ms間隔
  ) {
    this.pool = new PromisePool(maxConcurrent, rateLimitMs)
  }

  /**
   * 複数のテキストを並列翻訳
   */
  async translateMany<T extends { text: string; key: string }>(
    items: T[],
    translator: (text: string) => Promise<string>,
    onProgress?: (progress: number) => void
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>()
    const total = items.length
    let completed = 0

    // 優先度付きタスクを作成（短いテキストを優先）
    const tasks = items
      .sort((a, b) => a.text.length - b.text.length)
      .map(item => ({
        item,
        task: async () => {
          try {
            const translated = await translator(item.text)
            results.set(item.key, translated)
            this.stats.processed++
          } catch (error) {
            console.error(`Translation failed for "${item.text}":`, error)
            results.set(item.key, item.text) // 失敗時は原文を使用
            this.stats.failed++
          }
          
          completed++
          onProgress?.(Math.round((completed / total) * 100))
        }
      }))

    // 並列実行
    await this.pool.addAll(tasks.map(t => t.task))

    return results
  }

  /**
   * スマートバッチ翻訳（重複除去＋優先度付き）
   */
  async translateSmartBatch<T extends { text: string; key: string }>(
    items: T[],
    translator: (text: string) => Promise<string>,
    onProgress?: (progress: number) => void
  ): Promise<Map<string, string>> {
    // 重複を除去
    const uniqueTexts = new Map<string, string[]>()
    items.forEach(item => {
      const keys = uniqueTexts.get(item.text) || []
      keys.push(item.key)
      uniqueTexts.set(item.text, keys)
    })

    console.log(`[Parallel] Processing ${uniqueTexts.size} unique texts from ${items.length} items`)

    // テキストをサイズと複雑さで分類して優先度を決定
    const translationTasks = Array.from(uniqueTexts.keys()).map(text => ({
      text,
      keys: uniqueTexts.get(text)!,
      priority: this.calculatePriority(text, uniqueTexts.get(text)!.length)
    })).sort((a, b) => b.priority - a.priority) // 高優先度から処理

    const results = new Map<string, string>()
    let completed = 0
    const total = translationTasks.length

    // バッチサイズを動的に調整
    const batches = this.createSmartBatches(translationTasks)
    
    for (const batch of batches) {
      await this.pool.addAll(
        batch.map(({ text, keys }) => async () => {
          try {
            const translated = await translator(text)
            // 同じテキストを持つすべてのキーに結果を適用
            keys.forEach(key => {
              results.set(key, translated)
            })
            this.stats.processed += keys.length
            this.stats.apiCalls++
          } catch (error) {
            console.error(`Translation failed for "${text}":`, error)
            keys.forEach(key => {
              results.set(key, text)
            })
            this.stats.failed += keys.length
          }
          
          completed++
          onProgress?.(Math.round((completed / total) * 100))
        })
      )
    }

    console.log(`[Parallel] Stats:`, this.stats)
    
    return results
  }

  /**
   * テキストの優先度を計算（短い＋使用頻度高い = 高優先度）
   */
  private calculatePriority(text: string, usageCount: number): number {
    const length = text.length
    const complexity = (text.match(/[%\{\}\\]/g) || []).length // 特殊文字数
    const isShort = length < 50 ? 2 : length < 200 ? 1 : 0
    
    return usageCount * 10 + isShort * 5 - complexity - Math.floor(length / 100)
  }

  /**
   * スマートバッチ作成（サイズバランス考慮）
   */
  private createSmartBatches<T extends { text: string; priority: number }>(
    tasks: T[]
  ): T[][] {
    const batches: T[][] = []
    let currentBatch: T[] = []
    let currentBatchSize = 0
    const maxBatchSize = this.maxConcurrent * 2 // バッチサイズ制限

    for (const task of tasks) {
      const textSize = task.text.length
      
      // バッチサイズ制限またはテキストサイズバランスでバッチを分割
      if (currentBatch.length >= maxBatchSize || 
          (currentBatchSize > 1000 && textSize > 500)) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch)
          currentBatch = []
          currentBatchSize = 0
        }
      }
      
      currentBatch.push(task)
      currentBatchSize += textSize
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    console.log(`[Parallel] Created ${batches.length} smart batches`)
    return batches
  }

  /**
   * 統計情報を取得
   */
  getStats() {
    return { ...this.stats }
  }

  /**
   * 統計をリセット
   */
  resetStats() {
    this.stats = {
      processed: 0,
      failed: 0,
      cached: 0,
      apiCalls: 0
    }
  }
}

/**
 * Rate Limiter - API制限管理
 */
export class RateLimiter {
  private requests: number[] = []
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  /**
   * リクエストが可能かチェック
   */
  async waitForSlot(): Promise<void> {
    while (true) {
      const now = Date.now()
      // 時間窓外のリクエストを削除
      this.requests = this.requests.filter(time => now - time < this.windowMs)
      
      if (this.requests.length < this.maxRequests) {
        this.requests.push(now)
        return
      }
      
      // 最も古いリクエストが時間窓を出るまで待機
      const oldestRequest = this.requests[0]
      const waitTime = (oldestRequest + this.windowMs) - now
      await this.delay(Math.min(waitTime + 100, 1000))
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 現在のレート状態を取得
   */
  getStatus(): { current: number; max: number; resetIn: number } {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    const oldestRequest = this.requests[0]
    const resetIn = oldestRequest ? (oldestRequest + this.windowMs) - now : 0
    
    return {
      current: this.requests.length,
      max: this.maxRequests,
      resetIn: Math.max(0, resetIn)
    }
  }
}

// エクスポート
export const createParallelProcessor = (maxConcurrent?: number) => 
  new ParallelTranslationProcessor(maxConcurrent)

export const createRateLimiter = (maxRequests: number, windowMs: number) =>
  new RateLimiter(maxRequests, windowMs)