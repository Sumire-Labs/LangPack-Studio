/**
 * Adaptive Concurrency System for Translation Optimization
 * 翻訳最適化のための適応的並列度システム
 */

export interface NetworkCondition {
  status: 'excellent' | 'good' | 'normal' | 'poor' | 'critical'
  averageResponseTime: number // ms
  errorRate: number // 0-1
  throughput: number // requests/second
  lastUpdated: Date
}

export interface ConcurrencyConfig {
  maxConcurrent: number
  rateLimitMs: number
  backoffFactor: number
  healthCheckInterval: number
}

export interface PerformanceMetrics {
  responseTime: number
  errorRate: number
  throughput: number
  successRate: number
  queueDepth: number
}

export class AdaptiveConcurrencyManager {
  private currentConfig: ConcurrencyConfig
  private metrics: PerformanceMetrics[] = []
  private readonly maxMetricsHistory = 50
  private healthCheckTimer: NodeJS.Timeout | null = null
  private lastAdjustment = Date.now()
  
  // APIサービス別の最適化設定
  private static readonly SERVICE_PROFILES = {
    google: {
      baseConfig: { maxConcurrent: 3, rateLimitMs: 200, backoffFactor: 1.5, healthCheckInterval: 10000 },
      limits: { minConcurrent: 1, maxConcurrent: 8, minRateLimit: 100, maxRateLimit: 2000 }
    },
    gemini: {
      baseConfig: { maxConcurrent: 5, rateLimitMs: 100, backoffFactor: 1.3, healthCheckInterval: 8000 },
      limits: { minConcurrent: 1, maxConcurrent: 10, minRateLimit: 50, maxRateLimit: 1000 }
    },
    libretranslate: {
      baseConfig: { maxConcurrent: 2, rateLimitMs: 500, backoffFactor: 2.0, healthCheckInterval: 15000 },
      limits: { minConcurrent: 1, maxConcurrent: 5, minRateLimit: 200, maxRateLimit: 3000 }
    }
  }

  constructor(
    private service: keyof typeof AdaptiveConcurrencyManager.SERVICE_PROFILES,
    initialConfig?: Partial<ConcurrencyConfig>
  ) {
    const profile = AdaptiveConcurrencyManager.SERVICE_PROFILES[service]
    this.currentConfig = {
      ...profile.baseConfig,
      ...initialConfig
    }
    
    console.log(`[AdaptiveConcurrency] Initialized for ${service}:`, this.currentConfig)
    this.startHealthCheck()
  }

  /**
   * 現在のネットワーク状態を評価
   */
  evaluateNetworkCondition(): NetworkCondition {
    if (this.metrics.length === 0) {
      return {
        status: 'normal',
        averageResponseTime: 500,
        errorRate: 0,
        throughput: 0,
        lastUpdated: new Date()
      }
    }

    const recentMetrics = this.metrics.slice(-10) // 最新10回の平均
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
    const avgThroughput = recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length

    let status: NetworkCondition['status'] = 'normal'
    
    // ステータス判定ロジック
    if (avgErrorRate > 0.3) {
      status = 'critical'
    } else if (avgErrorRate > 0.15 || avgResponseTime > 3000) {
      status = 'poor'
    } else if (avgErrorRate > 0.05 || avgResponseTime > 1500) {
      status = 'normal'
    } else if (avgResponseTime < 500 && avgErrorRate < 0.02) {
      status = 'excellent'
    } else {
      status = 'good'
    }

    return {
      status,
      averageResponseTime: avgResponseTime,
      errorRate: avgErrorRate,
      throughput: avgThroughput,
      lastUpdated: new Date()
    }
  }

  /**
   * パフォーマンス指標を記録
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push({
      ...metrics,
      // タイムスタンプを追加
      timestamp: Date.now()
    } as any)

    // 履歴サイズ制限
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory)
    }

    // 条件が整ったら並列度を調整
    this.considerAdjustment()
  }

  /**
   * 並列度調整の検討
   */
  private considerAdjustment(): void {
    const timeSinceLastAdjustment = Date.now() - this.lastAdjustment
    const minAdjustmentInterval = 5000 // 5秒間隔で調整

    if (timeSinceLastAdjustment < minAdjustmentInterval) return
    
    const networkCondition = this.evaluateNetworkCondition()
    const newConfig = this.calculateOptimalConfig(networkCondition)
    
    if (this.shouldAdjustConfig(newConfig)) {
      this.adjustConcurrency(newConfig)
    }
  }

  /**
   * 最適な設定を計算
   */
  private calculateOptimalConfig(condition: NetworkCondition): ConcurrencyConfig {
    const profile = AdaptiveConcurrencyManager.SERVICE_PROFILES[this.service]
    const base = this.currentConfig
    let newConfig = { ...base }

    switch (condition.status) {
      case 'excellent':
        // 高速・安定時は並列度を増加
        newConfig.maxConcurrent = Math.min(base.maxConcurrent + 1, profile.limits.maxConcurrent)
        newConfig.rateLimitMs = Math.max(base.rateLimitMs * 0.9, profile.limits.minRateLimit)
        break

      case 'good':
        // 良好時は微調整
        if (condition.averageResponseTime < 300) {
          newConfig.maxConcurrent = Math.min(base.maxConcurrent + 1, profile.limits.maxConcurrent)
        }
        break

      case 'normal':
        // 通常時は現状維持または微調整
        break

      case 'poor':
        // 低品質時は並列度を減少
        newConfig.maxConcurrent = Math.max(base.maxConcurrent - 1, profile.limits.minConcurrent)
        newConfig.rateLimitMs = Math.min(base.rateLimitMs * 1.3, profile.limits.maxRateLimit)
        break

      case 'critical':
        // 危機的状況時は大幅減少
        newConfig.maxConcurrent = profile.limits.minConcurrent
        newConfig.rateLimitMs = profile.limits.maxRateLimit
        break
    }

    return newConfig
  }

  /**
   * 設定変更の必要性を判定
   */
  private shouldAdjustConfig(newConfig: ConcurrencyConfig): boolean {
    return (
      newConfig.maxConcurrent !== this.currentConfig.maxConcurrent ||
      Math.abs(newConfig.rateLimitMs - this.currentConfig.rateLimitMs) > 50
    )
  }

  /**
   * 並列度を調整
   */
  private adjustConcurrency(newConfig: ConcurrencyConfig): void {
    const oldConfig = { ...this.currentConfig }
    this.currentConfig = newConfig
    this.lastAdjustment = Date.now()

    const condition = this.evaluateNetworkCondition()
    
    console.log(`[AdaptiveConcurrency] ${this.service} adjustment:`, {
      condition: condition.status,
      concurrency: `${oldConfig.maxConcurrent} → ${newConfig.maxConcurrent}`,
      rateLimit: `${oldConfig.rateLimitMs}ms → ${newConfig.rateLimitMs}ms`,
      metrics: {
        avgResponseTime: `${condition.averageResponseTime.toFixed(0)}ms`,
        errorRate: `${(condition.errorRate * 100).toFixed(1)}%`,
        throughput: `${condition.throughput.toFixed(1)}/s`
      }
    })

    // 調整理由をログ出力
    this.logAdjustmentReason(condition, oldConfig, newConfig)
  }

  /**
   * 調整理由をログ出力
   */
  private logAdjustmentReason(condition: NetworkCondition, oldConfig: ConcurrencyConfig, newConfig: ConcurrencyConfig): void {
    const reasons: string[] = []

    if (condition.status === 'excellent' && newConfig.maxConcurrent > oldConfig.maxConcurrent) {
      reasons.push('高速応答のため並列度を増加')
    }
    if (condition.status === 'poor' && newConfig.maxConcurrent < oldConfig.maxConcurrent) {
      reasons.push('応答遅延のため並列度を減少')
    }
    if (condition.errorRate > 0.1) {
      reasons.push(`エラー率${(condition.errorRate * 100).toFixed(1)}%のため制限強化`)
    }
    if (condition.averageResponseTime > 2000) {
      reasons.push('レスポンス時間超過のため調整')
    }

    if (reasons.length > 0) {
      console.log(`[AdaptiveConcurrency] Adjustment reasons:`, reasons)
    }
  }

  /**
   * 定期的なヘルスチェック
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      const condition = this.evaluateNetworkCondition()
      
      // 長時間問題が続く場合の対処
      if (condition.status === 'critical' || condition.status === 'poor') {
        this.handleDegradedPerformance(condition)
      }

      // 統計情報の出力（デバッグ用）
      if (this.metrics.length > 5) {
        this.logPerformanceSummary(condition)
      }
    }, this.currentConfig.healthCheckInterval)
  }

  /**
   * パフォーマンス低下時の対処
   */
  private handleDegradedPerformance(condition: NetworkCondition): void {
    const profile = AdaptiveConcurrencyManager.SERVICE_PROFILES[this.service]
    
    if (condition.status === 'critical') {
      // 緊急時：最小設定に戻す
      this.currentConfig = {
        ...profile.baseConfig,
        maxConcurrent: 1,
        rateLimitMs: profile.limits.maxRateLimit
      }
      console.warn(`[AdaptiveConcurrency] Emergency mode activated for ${this.service}`)
    }
  }

  /**
   * パフォーマンス要約をログ出力
   */
  private logPerformanceSummary(condition: NetworkCondition): void {
    const recentMetrics = this.metrics.slice(-20)
    const avgThroughput = recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length

    console.log(`[AdaptiveConcurrency] ${this.service} Performance Summary:`, {
      status: condition.status,
      config: `${this.currentConfig.maxConcurrent} concurrent, ${this.currentConfig.rateLimitMs}ms interval`,
      performance: {
        responseTime: `${condition.averageResponseTime.toFixed(0)}ms`,
        errorRate: `${(condition.errorRate * 100).toFixed(1)}%`,
        throughput: `${avgThroughput.toFixed(1)} req/s`
      }
    })
  }

  /**
   * 現在の設定を取得
   */
  getCurrentConfig(): ConcurrencyConfig {
    return { ...this.currentConfig }
  }

  /**
   * パフォーマンス統計を取得
   */
  getPerformanceStats(): {
    current: NetworkCondition
    history: PerformanceMetrics[]
    config: ConcurrencyConfig
  } {
    return {
      current: this.evaluateNetworkCondition(),
      history: [...this.metrics],
      config: this.getCurrentConfig()
    }
  }

  /**
   * 手動でリセット
   */
  reset(): void {
    const profile = AdaptiveConcurrencyManager.SERVICE_PROFILES[this.service]
    this.currentConfig = { ...profile.baseConfig }
    this.metrics = []
    this.lastAdjustment = Date.now()
    console.log(`[AdaptiveConcurrency] Reset to defaults for ${this.service}`)
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }
  }
}

/**
 * 使用例とファクトリー関数
 */
export function createAdaptiveConcurrencyManager(
  service: 'google' | 'gemini' | 'libretranslate',
  options?: Partial<ConcurrencyConfig>
): AdaptiveConcurrencyManager {
  return new AdaptiveConcurrencyManager(service, options)
}