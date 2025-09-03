/**
 * Adaptive Concurrency Demo
 * アダプティブ並列度のデモンストレーション
 */

import { createAdaptiveParallelProcessor } from './parallelProcessor'

// シミュレーション用のモックAPI
class MockAPIService {
  private responseTime: number
  private errorRate: number
  private requestCount = 0

  constructor(responseTime = 200, errorRate = 0.05) {
    this.responseTime = responseTime
    this.errorRate = errorRate
  }

  // APIの状態を動的に変更（デモ用）
  setCondition(responseTime: number, errorRate: number) {
    this.responseTime = responseTime
    this.errorRate = errorRate
    console.log(`[MockAPI] 🔄 Condition changed: ${responseTime}ms response, ${(errorRate*100).toFixed(1)}% error rate`)
  }

  async translate(text: string): Promise<string> {
    this.requestCount++
    
    // レスポンス時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, this.responseTime))
    
    // エラー率をシミュレート
    if (Math.random() < this.errorRate) {
      throw new Error(`Mock API Error (request #${this.requestCount})`)
    }
    
    return `[翻訳] ${text} (${this.requestCount})`
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      responseTime: this.responseTime,
      errorRate: this.errorRate
    }
  }

  reset() {
    this.requestCount = 0
  }
}

// デモ実行
export async function runAdaptiveConcurrencyDemo() {
  console.log('🚀 アダプティブ並列度デモを開始します...\n')

  // テストデータ生成
  const testData = Array.from({ length: 50 }, (_, i) => ({
    key: `test_key_${i}`,
    text: `Test text ${i}: This is a sample translation text.`
  }))

  // Mock APIサービス
  const mockAPI = new MockAPIService(300, 0.02) // 初期: 300ms, 2%エラー率
  
  // アダプティブプロセッサー作成
  const adaptiveProcessor = createAdaptiveParallelProcessor('google', 3, 200)

  console.log('📊 シナリオ1: 良好な状態 → 優秀な状態')
  console.log('期待される動作: 並列度が徐々に増加\n')

  // Phase 1: 良好な状態で開始
  mockAPI.setCondition(200, 0.01) // 200ms, 1%エラー
  
  let results = await adaptiveProcessor.translateSmartBatch(
    testData.slice(0, 20),
    (text) => mockAPI.translate(text)
  )
  
  let stats = adaptiveProcessor.getAdaptiveStats()
  console.log('Phase 1 結果:', {
    networkStatus: stats.current.status,
    concurrency: stats.config.maxConcurrent,
    rateLimit: `${stats.config.rateLimitMs}ms`,
    processed: results.size
  })

  await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒待機

  // Phase 2: さらに良い状態に改善
  mockAPI.setCondition(100, 0.005) // 100ms, 0.5%エラー
  
  results = await adaptiveProcessor.translateSmartBatch(
    testData.slice(20, 35),
    (text) => mockAPI.translate(text)
  )
  
  stats = adaptiveProcessor.getAdaptiveStats()
  console.log('Phase 2 結果:', {
    networkStatus: stats.current.status,
    concurrency: stats.config.maxConcurrent,
    rateLimit: `${stats.config.rateLimitMs}ms`,
    processed: results.size
  })
  console.log('✅ 並列度が増加しました!\n')

  await new Promise(resolve => setTimeout(resolve, 3000))

  console.log('📊 シナリオ2: 状態悪化 → 自動調整')
  console.log('期待される動作: 並列度が自動的に減少\n')

  // Phase 3: 状態が悪化
  mockAPI.setCondition(800, 0.15) // 800ms, 15%エラー
  
  results = await adaptiveProcessor.translateSmartBatch(
    testData.slice(35, 45),
    (text) => mockAPI.translate(text)
  )
  
  stats = adaptiveProcessor.getAdaptiveStats()
  console.log('Phase 3 結果:', {
    networkStatus: stats.current.status,
    concurrency: stats.config.maxConcurrent,
    rateLimit: `${stats.config.rateLimitMs}ms`,
    processed: results.size
  })

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Phase 4: 危機的状態
  mockAPI.setCondition(2000, 0.4) // 2秒, 40%エラー
  
  results = await adaptiveProcessor.translateSmartBatch(
    testData.slice(45, 50),
    (text) => mockAPI.translate(text)
  )
  
  stats = adaptiveProcessor.getAdaptiveStats()
  console.log('Phase 4 結果:', {
    networkStatus: stats.current.status,
    concurrency: stats.config.maxConcurrent,
    rateLimit: `${stats.config.rateLimitMs}ms`,
    processed: results.size
  })
  console.log('⚠️  緊急モード: 並列度が最小に調整されました!\n')

  // 最終統計
  const finalStats = adaptiveProcessor.getAdaptiveStats()
  const mockStats = mockAPI.getStats()
  
  console.log('📈 最終統計:')
  console.log('- ネットワーク状態:', finalStats.current.status)
  console.log('- 平均応答時間:', `${finalStats.current.averageResponseTime.toFixed(0)}ms`)
  console.log('- エラー率:', `${(finalStats.current.errorRate * 100).toFixed(1)}%`)
  console.log('- 最終並列度:', finalStats.config.maxConcurrent)
  console.log('- 最終レート制限:', `${finalStats.config.rateLimitMs}ms`)
  console.log('- 総リクエスト数:', mockStats.requestCount)

  console.log('\n✅ アダプティブ並列度デモ完了!')
  console.log('💡 実際の使用では、API状態に応じて自動的に最適化されます')

  // クリーンアップ
  adaptiveProcessor.dispose()
}

// 比較デモ: 固定 vs アダプティブ
export async function runComparisonDemo() {
  console.log('⚔️  比較デモ: 固定並列度 vs アダプティブ並列度\n')

  const testData = Array.from({ length: 30 }, (_, i) => ({
    key: `compare_${i}`,
    text: `Comparison test ${i}`
  }))

  // 不安定なAPI条件をシミュレート
  const unstableMockAPI = new MockAPIService(500, 0.1)
  
  // API状態を動的に変化させる
  let conditionIndex = 0
  const conditions = [
    [200, 0.02], // 良好
    [100, 0.01], // 優秀
    [800, 0.2],  // 悪い
    [2000, 0.4], // 危機的
    [300, 0.05]  // 回復
  ]

  const apiUpdater = setInterval(() => {
    const [responseTime, errorRate] = conditions[conditionIndex % conditions.length]
    unstableMockAPI.setCondition(responseTime, errorRate)
    conditionIndex++
  }, 3000) // 3秒ごとに条件変更

  // 固定並列度プロセッサ
  const { ParallelTranslationProcessor } = await import('./parallelProcessor')
  const fixedProcessor = new ParallelTranslationProcessor(5, 200)

  // アダプティブプロセッサ
  const adaptiveProcessor = createAdaptiveParallelProcessor('google', 5, 200)

  console.log('🏁 固定並列度で実行...')
  const fixedStart = Date.now()
  try {
    await fixedProcessor.translateSmartBatch(
      testData.slice(0, 15),
      (text) => unstableMockAPI.translate(text)
    )
  } catch (error) {
    console.log('固定プロセッサでエラーが発生しました')
  }
  const fixedTime = Date.now() - fixedStart

  await new Promise(resolve => setTimeout(resolve, 1000))
  unstableMockAPI.reset()

  console.log('🚀 アダプティブ並列度で実行...')
  const adaptiveStart = Date.now()
  try {
    await adaptiveProcessor.translateSmartBatch(
      testData.slice(15, 30),
      (text) => unstableMockAPI.translate(text)
    )
  } catch (error) {
    console.log('アダプティブプロセッサでエラーが発生しました')
  }
  const adaptiveTime = Date.now() - adaptiveStart

  clearInterval(apiUpdater)

  console.log('\n📊 比較結果:')
  console.log('- 固定並列度:', `${fixedTime}ms`)
  console.log('- アダプティブ並列度:', `${adaptiveTime}ms`)
  console.log('- 改善率:', `${Math.round((1 - adaptiveTime / fixedTime) * 100)}%`)

  const adaptiveStats = adaptiveProcessor.getAdaptiveStats()
  console.log('- アダプティブ最終状態:', adaptiveStats.current.status)
  console.log('- 最終並列度:', adaptiveStats.config.maxConcurrent)

  // クリーンアップ
  adaptiveProcessor.dispose()
}

// すぐに実行する場合
if (typeof window === 'undefined') {
  // Node.js環境での実行
  runAdaptiveConcurrencyDemo()
    .then(() => runComparisonDemo())
    .catch(console.error)
}