/**
 * Performance Testing Suite for Translation Optimization
 * 翻訳最適化のパフォーマンステスト
 */

import { translationCache } from './translationCache'
import { ParallelTranslationProcessor } from './parallelProcessor'

// テストデータ生成
export function generateTestData(size: number): Array<{ key: string; text: string }> {
  const testTexts = [
    'Hello world',
    'This is a test',
    'Minecraft is a game',
    'Resource pack',
    'Translation system',
    'Performance optimization',
    'Cache hit rate',
    'Parallel processing',
    'Batch translation',
    'API rate limiting',
    'Error handling',
    'Quality check',
    'Statistics reporting',
    'User interface',
    'File parsing',
    'JSON format',
    'Language file',
    'Mod localization',
    'Game translation',
    'Text processing'
  ]

  const data = []
  for (let i = 0; i < size; i++) {
    const text = testTexts[i % testTexts.length]
    data.push({
      key: `test_key_${i}`,
      text: i < size / 2 ? text : `${text} (variant ${i})` // 重複とバリエーションを混在
    })
  }
  return data
}

// モックトランスレーター（実際のAPIを使わないテスト用）
export class MockTranslator {
  private delay: number
  private failureRate: number
  private callCount = 0

  constructor(delay = 100, failureRate = 0.05) {
    this.delay = delay
    this.failureRate = failureRate
  }

  async translate(text: string): Promise<string> {
    this.callCount++
    
    // 遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, this.delay))
    
    // ランダム失敗をシミュレート
    if (Math.random() < this.failureRate) {
      throw new Error(`Mock translation failed for: ${text}`)
    }
    
    // 簡単な変換（実際の翻訳をシミュレート）
    return `[翻訳] ${text}`
  }

  getCallCount(): number {
    return this.callCount
  }

  reset(): void {
    this.callCount = 0
  }
}

// シーケンシャル翻訳（最適化前）
export async function sequentialTranslation(
  data: Array<{ key: string; text: string }>,
  translator: MockTranslator
): Promise<{
  results: Map<string, string>
  timeMs: number
  apiCalls: number
}> {
  const startTime = Date.now()
  const results = new Map<string, string>()
  translator.reset()

  for (const item of data) {
    try {
      const translated = await translator.translate(item.text)
      results.set(item.key, translated)
    } catch (error) {
      results.set(item.key, item.text) // Fallback to original
    }
  }

  return {
    results,
    timeMs: Date.now() - startTime,
    apiCalls: translator.getCallCount()
  }
}

// 並列翻訳（最適化後）
export async function parallelTranslation(
  data: Array<{ key: string; text: string }>,
  translator: MockTranslator,
  maxConcurrent = 5
): Promise<{
  results: Map<string, string>
  timeMs: number
  apiCalls: number
  stats: any
}> {
  const startTime = Date.now()
  translator.reset()
  
  const processor = new ParallelTranslationProcessor(maxConcurrent, 50) // 50ms間隔
  
  const results = await processor.translateSmartBatch(
    data,
    (text: string) => translator.translate(text)
  )

  return {
    results,
    timeMs: Date.now() - startTime,
    apiCalls: translator.getCallCount(),
    stats: processor.getStats()
  }
}

// キャッシュ効果テスト
export async function cacheEffectivenessTest(
  data: Array<{ key: string; text: string }>,
  translator: MockTranslator
): Promise<{
  firstRun: { timeMs: number; apiCalls: number; cacheHits: number }
  secondRun: { timeMs: number; apiCalls: number; cacheHits: number }
  improvement: { timeReduction: number; apiReduction: number; hitRate: number }
}> {
  // キャッシュクリア
  translationCache.clear()
  
  // 1回目の実行
  translator.reset()
  const startTime1 = Date.now()
  for (const item of data) {
    const cached = translationCache.get(item.text, 'en', 'ja', 'test')
    if (!cached) {
      try {
        const translated = await translator.translate(item.text)
        translationCache.set(item.text, translated, 'en', 'ja', 'test')
      } catch (error) {
        translationCache.set(item.text, item.text, 'en', 'ja', 'test')
      }
    }
  }
  const time1 = Date.now() - startTime1
  const calls1 = translator.getCallCount()
  const stats1 = translationCache.getStats()

  // 2回目の実行（キャッシュ効果を確認）
  translator.reset()
  const startTime2 = Date.now()
  let hits2 = 0
  for (const item of data) {
    const cached = translationCache.get(item.text, 'en', 'ja', 'test')
    if (cached) {
      hits2++
    } else {
      try {
        const translated = await translator.translate(item.text)
        translationCache.set(item.text, translated, 'en', 'ja', 'test')
      } catch (error) {
        translationCache.set(item.text, item.text, 'en', 'ja', 'test')
      }
    }
  }
  const time2 = Date.now() - startTime2
  const calls2 = translator.getCallCount()
  const stats2 = translationCache.getStats()

  return {
    firstRun: {
      timeMs: time1,
      apiCalls: calls1,
      cacheHits: stats1.totalHits
    },
    secondRun: {
      timeMs: time2,
      apiCalls: calls2,
      cacheHits: hits2
    },
    improvement: {
      timeReduction: Math.round(((time1 - time2) / time1) * 100),
      apiReduction: Math.round(((calls1 - calls2) / calls1) * 100),
      hitRate: Math.round((hits2 / data.length) * 100)
    }
  }
}

// 総合パフォーマンステスト
export async function runPerformanceTest(dataSize = 100): Promise<void> {
  console.log('🚀 Translation Performance Test Starting...\n')
  
  const testData = generateTestData(dataSize)
  const translator = new MockTranslator(50, 0.02) // 50ms遅延、2%失敗率

  console.log(`📊 Test Configuration:`)
  console.log(`  - Data size: ${testData.length} items`)
  console.log(`  - Mock delay: ${50}ms per request`)
  console.log(`  - Failure rate: ${2}%`)
  console.log(`  - Unique texts: ${new Set(testData.map(d => d.text)).size}\n`)

  // 1. シーケンシャル翻訳
  console.log('1️⃣ Sequential Translation (Before Optimization):')
  const sequentialResult = await sequentialTranslation(testData, translator)
  console.log(`   ⏱️  Time: ${sequentialResult.timeMs}ms`)
  console.log(`   📞 API Calls: ${sequentialResult.apiCalls}`)
  console.log(`   ✅ Success: ${sequentialResult.results.size}/${testData.length}\n`)

  // 2. 並列翻訳
  console.log('2️⃣ Parallel Translation (After Optimization):')
  const parallelResult = await parallelTranslation(testData, translator, 5)
  console.log(`   ⏱️  Time: ${parallelResult.timeMs}ms`)
  console.log(`   📞 API Calls: ${parallelResult.apiCalls}`)
  console.log(`   ✅ Success: ${parallelResult.results.size}/${testData.length}`)
  console.log(`   📈 Processed: ${parallelResult.stats.processed}`)
  console.log(`   ❌ Failed: ${parallelResult.stats.failed}\n`)

  // 3. 改善効果
  const timeImprovement = Math.round(((sequentialResult.timeMs - parallelResult.timeMs) / sequentialResult.timeMs) * 100)
  const apiImprovement = Math.round(((sequentialResult.apiCalls - parallelResult.apiCalls) / sequentialResult.apiCalls) * 100)
  
  console.log('📈 Performance Improvement:')
  console.log(`   ⚡ Time: ${timeImprovement}% faster`)
  console.log(`   💰 API Calls: ${apiImprovement}% reduction`)
  console.log(`   🔄 Deduplication: ${sequentialResult.apiCalls - parallelResult.apiCalls} calls saved\n`)

  // 4. キャッシュ効果テスト
  console.log('3️⃣ Cache Effectiveness Test:')
  const cacheResult = await cacheEffectivenessTest(testData.slice(0, 50), translator)
  console.log(`   1st run: ${cacheResult.firstRun.timeMs}ms, ${cacheResult.firstRun.apiCalls} API calls`)
  console.log(`   2nd run: ${cacheResult.secondRun.timeMs}ms, ${cacheResult.secondRun.apiCalls} API calls, ${cacheResult.secondRun.cacheHits} cache hits`)
  console.log(`   🎯 Cache hit rate: ${cacheResult.improvement.hitRate}%`)
  console.log(`   ⚡ Time reduction: ${cacheResult.improvement.timeReduction}%`)
  console.log(`   💰 API reduction: ${cacheResult.improvement.apiReduction}%\n`)

  // キャッシュ統計
  const cacheStats = translationCache.getStats()
  console.log('📊 Cache Statistics:')
  console.log(`   Total entries: ${cacheStats.totalEntries}`)
  console.log(`   Hit rate: ${cacheStats.hitRate.toFixed(1)}%`)
  console.log(`   Memory usage: ${(cacheStats.memoryUsage / 1024).toFixed(2)} KB\n`)

  console.log('✅ Performance Test Complete!')
}

// メイン実行関数
export function startPerformanceTest(): void {
  runPerformanceTest(200).catch(console.error)
}