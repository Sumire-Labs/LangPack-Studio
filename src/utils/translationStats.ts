export interface TranslationCost {
  service: string
  inputTokens?: number
  outputTokens?: number
  characters: number
  estimatedCost: number
  currency: string
}

export interface TranslationSession {
  id: string
  startTime: Date
  endTime?: Date
  service: string
  fromLanguage: string
  toLanguage: string
  totalEntries: number
  successfulEntries: number
  failedEntries: number
  totalCharacters: number
  costs: TranslationCost
  qualityScore?: number
}

export interface UsageStats {
  totalSessions: number
  totalTranslations: number
  totalCharacters: number
  totalCost: number
  averageQualityScore: number
  serviceUsage: { [service: string]: number }
  languagePairs: { [pair: string]: number }
  dailyUsage: { [date: string]: number }
  monthlyCosts: { [month: string]: number }
}

export class TranslationStatsManager {
  private static readonly STORAGE_KEY = 'langpack-studio-stats'
  
  // API料金設定（2024年時点の料金）
  private static readonly PRICING = {
    google: { perCharacter: 0.00002, currency: 'USD' }, // $20/1M chars
    deepl: { perCharacter: 0.00005, currency: 'USD' }, // $5.99/month (unlimited) or $6.99/month pro
    azure: { perCharacter: 0.00001, currency: 'USD' }, // $10/1M chars
    openai: { 
      inputToken: 0.002 / 1000, // $0.002/1K tokens
      outputToken: 0.002 / 1000,
      currency: 'USD'
    },
    gemini: { 
      inputToken: 0.00025 / 1000, // $0.00025/1K tokens
      outputToken: 0.0005 / 1000,
      currency: 'USD'
    },
    libretranslate: { perCharacter: 0, currency: 'USD' } // Free
  }

  static calculateCost(
    service: string,
    characters: number,
    inputTokens?: number,
    outputTokens?: number
  ): TranslationCost {
    const pricing = this.PRICING[service as keyof typeof this.PRICING]
    let estimatedCost = 0

    if (!pricing) {
      return {
        service,
        characters,
        inputTokens,
        outputTokens,
        estimatedCost: 0,
        currency: 'USD'
      }
    }

    if ('perCharacter' in pricing) {
      estimatedCost = characters * pricing.perCharacter
    } else if ('inputToken' in pricing && inputTokens && outputTokens) {
      estimatedCost = (inputTokens * pricing.inputToken) + (outputTokens * pricing.outputToken)
    }

    return {
      service,
      characters,
      inputTokens,
      outputTokens,
      estimatedCost,
      currency: pricing.currency
    }
  }

  static estimateTokens(text: string): number {
    // 簡易的なトークン数推定（実際のトークナイザーではない）
    // 平均的に1トークン = 4文字として計算
    return Math.ceil(text.length / 4)
  }

  static startSession(
    service: string,
    fromLanguage: string,
    toLanguage: string,
    totalEntries: number
  ): TranslationSession {
    const session: TranslationSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      service,
      fromLanguage,
      toLanguage,
      totalEntries,
      successfulEntries: 0,
      failedEntries: 0,
      totalCharacters: 0,
      costs: {
        service,
        characters: 0,
        estimatedCost: 0,
        currency: 'USD'
      }
    }

    return session
  }

  static endSession(
    session: TranslationSession,
    successfulEntries: number,
    failedEntries: number,
    totalCharacters: number,
    qualityScore?: number
  ): TranslationSession {
    session.endTime = new Date()
    session.successfulEntries = successfulEntries
    session.failedEntries = failedEntries
    session.totalCharacters = totalCharacters
    session.qualityScore = qualityScore

    // コスト計算
    const inputTokens = this.estimateTokens(totalCharacters.toString())
    const outputTokens = this.estimateTokens((totalCharacters * 1.2).toString()) // 翻訳は通常1.2倍程度

    session.costs = this.calculateCost(
      session.service,
      totalCharacters,
      inputTokens,
      outputTokens
    )

    // セッションを保存
    this.saveSession(session)

    return session
  }

  static saveSession(session: TranslationSession): void {
    const existingSessions = this.loadSessions()
    existingSessions.push(session)
    
    // 最新100セッションのみ保持
    const recentSessions = existingSessions.slice(-100)
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentSessions))
  }

  static loadSessions(): TranslationSession[] {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const sessions = JSON.parse(stored)
      return sessions.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined
      }))
    } catch (error) {
      console.error('Failed to load translation sessions:', error)
      return []
    }
  }

  static getUsageStats(days: number = 30): UsageStats {
    const sessions = this.loadSessions()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentSessions = sessions.filter(s => s.startTime >= cutoffDate)

    const totalTranslations = recentSessions.reduce((sum, s) => sum + s.successfulEntries, 0)
    const totalCharacters = recentSessions.reduce((sum, s) => sum + s.totalCharacters, 0)
    const totalCost = recentSessions.reduce((sum, s) => sum + s.costs.estimatedCost, 0)
    
    const qualityScores = recentSessions
      .filter(s => s.qualityScore !== undefined)
      .map(s => s.qualityScore!)
    const averageQualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0

    // サービス使用量
    const serviceUsage: { [service: string]: number } = {}
    recentSessions.forEach(s => {
      serviceUsage[s.service] = (serviceUsage[s.service] || 0) + s.successfulEntries
    })

    // 言語ペア使用量
    const languagePairs: { [pair: string]: number } = {}
    recentSessions.forEach(s => {
      const pair = `${s.fromLanguage}-${s.toLanguage}`
      languagePairs[pair] = (languagePairs[pair] || 0) + s.successfulEntries
    })

    // 日別使用量
    const dailyUsage: { [date: string]: number } = {}
    recentSessions.forEach(s => {
      const date = s.startTime.toISOString().split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + s.successfulEntries
    })

    // 月別コスト
    const monthlyCosts: { [month: string]: number } = {}
    recentSessions.forEach(s => {
      const month = `${s.startTime.getFullYear()}-${String(s.startTime.getMonth() + 1).padStart(2, '0')}`
      monthlyCosts[month] = (monthlyCosts[month] || 0) + s.costs.estimatedCost
    })

    return {
      totalSessions: recentSessions.length,
      totalTranslations,
      totalCharacters,
      totalCost,
      averageQualityScore,
      serviceUsage,
      languagePairs,
      dailyUsage,
      monthlyCosts
    }
  }

  static generateDetailedReport(days: number = 30): {
    stats: UsageStats
    sessions: TranslationSession[]
    recommendations: string[]
  } {
    const stats = this.getUsageStats(days)
    const sessions = this.loadSessions().slice(-20) // 最新20セッション

    const recommendations: string[] = []

    // コスト最適化の提案
    if (stats.totalCost > 50) {
      recommendations.push('月間コストが高額です。無料のLibreTranslateの使用を検討してください。')
    }

    // 品質スコアに基づく提案
    if (stats.averageQualityScore < 70) {
      recommendations.push('翻訳品質が低下しています。DeepLやGeminiの使用を検討してください。')
    }

    // 使用パターンに基づく提案
    const mostUsedService = Object.keys(stats.serviceUsage).reduce((a, b) => 
      stats.serviceUsage[a] > stats.serviceUsage[b] ? a : b
    )

    if (mostUsedService === 'google' && stats.totalCost > 20) {
      recommendations.push('Google Translateを多用しています。コスト削減のためGemini APIの使用を検討してください。')
    }

    return {
      stats,
      sessions,
      recommendations
    }
  }

  static exportReport(format: 'json' | 'csv' = 'json'): string {
    const report = this.generateDetailedReport()

    if (format === 'csv') {
      const csvLines = ['日時,サービス,言語ペア,エントリー数,文字数,コスト,品質スコア']
      
      report.sessions.forEach(session => {
        const line = [
          session.startTime.toISOString(),
          session.service,
          `${session.fromLanguage}-${session.toLanguage}`,
          session.successfulEntries,
          session.totalCharacters,
          session.costs.estimatedCost.toFixed(4),
          session.qualityScore?.toFixed(1) || 'N/A'
        ].join(',')
        csvLines.push(line)
      })

      return csvLines.join('\n')
    }

    return JSON.stringify(report, null, 2)
  }

  static clearStats(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}