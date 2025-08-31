export interface QualityIssue {
  type: 'placeholder_mismatch' | 'length_warning' | 'empty_translation' | 'special_chars' | 'consistency' | 'formatting'
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  originalText?: string
  translatedText?: string
  position?: number
}

export interface QualityCheckResult {
  key: string
  originalText: string
  translatedText: string
  issues: QualityIssue[]
  score: number // 0-100の品質スコア
}

export interface QualityReport {
  totalChecked: number
  totalIssues: number
  errorCount: number
  warningCount: number
  averageScore: number
  results: QualityCheckResult[]
  summary: {
    placeholderIssues: number
    lengthWarnings: number
    emptyTranslations: number
    formattingIssues: number
    consistencyIssues: number
  }
}

export class TranslationQualityChecker {
  private static readonly PLACEHOLDER_PATTERNS = [
    /\$\{[^}]+\}/g,        // ${variable}
    /%[sdifg%]/g,          // %s, %d, %i, %f, %g, %%
    /%\d+\$[sdifg]/g,      // %1$s, %2$d etc
    /%[a-zA-Z_]+%/g,       // %variable%
    /\{[^}]+\}/g,          // {variable}
    /\[[^\]]+\]/g,         // [variable]
  ]

  private static readonly SPECIAL_CHARS = [
    '\\n', '\\t', '\\r',   // Escape sequences
    '&[a-z]+;',            // HTML entities
    '§[0-9a-fk-or]',       // Minecraft color codes
  ]

  static checkTranslation(
    key: string, 
    original: string, 
    translated: string,
    allTranslations?: Map<string, string>
  ): QualityCheckResult {
    const issues: QualityIssue[] = []

    // 1. プレースホルダーの整合性チェック
    issues.push(...this.checkPlaceholders(original, translated))

    // 2. 空の翻訳チェック
    issues.push(...this.checkEmptyTranslation(original, translated))

    // 3. 文字数の大幅な違いをチェック
    issues.push(...this.checkLengthDifference(original, translated))

    // 4. 特殊文字の整合性チェック
    issues.push(...this.checkSpecialCharacters(original, translated))

    // 5. フォーマットの整合性チェック
    issues.push(...this.checkFormatting(original, translated))

    // 6. 一貫性チェック（同じ原文に対する翻訳の一貫性）
    if (allTranslations) {
      issues.push(...this.checkConsistency(key, original, translated, allTranslations))
    }

    // スコア計算（100点満点）
    const score = this.calculateQualityScore(issues)

    return {
      key,
      originalText: original,
      translatedText: translated,
      issues,
      score
    }
  }

  static checkPlaceholders(original: string, translated: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    for (const pattern of this.PLACEHOLDER_PATTERNS) {
      const originalMatches = original.match(pattern) || []
      const translatedMatches = translated.match(pattern) || []

      // プレースホルダーの数が一致しない
      if (originalMatches.length !== translatedMatches.length) {
        issues.push({
          type: 'placeholder_mismatch',
          severity: 'error',
          message: `プレースホルダーの数が一致しません (原文: ${originalMatches.length}, 翻訳: ${translatedMatches.length})`,
          suggestion: '原文と同じ数のプレースホルダーを含めてください',
          originalText: original,
          translatedText: translated
        })
        continue
      }

      // プレースホルダーの内容が一致しない
      for (let i = 0; i < originalMatches.length; i++) {
        if (originalMatches[i] !== translatedMatches[i]) {
          issues.push({
            type: 'placeholder_mismatch',
            severity: 'warning',
            message: `プレースホルダーが変更されています: "${originalMatches[i]}" → "${translatedMatches[i]}"`,
            suggestion: '原文と同じプレースホルダーを使用してください'
          })
        }
      }
    }

    return issues
  }

  static checkEmptyTranslation(original: string, translated: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    if (translated.trim() === '') {
      issues.push({
        type: 'empty_translation',
        severity: 'error',
        message: '翻訳が空です',
        suggestion: '適切な翻訳を入力してください'
      })
    } else if (translated.trim() === original.trim()) {
      issues.push({
        type: 'empty_translation',
        severity: 'warning',
        message: '翻訳が原文と同じです',
        suggestion: '適切な翻訳を行ってください'
      })
    }

    return issues
  }

  static checkLengthDifference(original: string, translated: string): QualityIssue[] {
    const issues: QualityIssue[] = []
    const ratio = translated.length / original.length

    // 翻訳が原文の3倍以上または1/3以下の場合に警告
    if (ratio > 3) {
      issues.push({
        type: 'length_warning',
        severity: 'warning',
        message: `翻訳が原文より大幅に長いです (${Math.round(ratio * 100)}%)`,
        suggestion: 'より簡潔な翻訳を検討してください'
      })
    } else if (ratio < 0.33 && original.length > 10) {
      issues.push({
        type: 'length_warning',
        severity: 'warning',
        message: `翻訳が原文より大幅に短いです (${Math.round(ratio * 100)}%)`,
        suggestion: '翻訳が不完全でないか確認してください'
      })
    }

    return issues
  }

  static checkSpecialCharacters(original: string, translated: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 改行文字のチェック
    const originalNewlines = (original.match(/\\n/g) || []).length
    const translatedNewlines = (translated.match(/\\n/g) || []).length

    if (originalNewlines !== translatedNewlines) {
      issues.push({
        type: 'special_chars',
        severity: 'warning',
        message: `改行文字の数が一致しません (原文: ${originalNewlines}, 翻訳: ${translatedNewlines})`,
        suggestion: '原文と同じ位置に改行を入れてください'
      })
    }

    // Minecraftカラーコードのチェック
    const originalColors = (original.match(/§[0-9a-fk-or]/g) || []).length
    const translatedColors = (translated.match(/§[0-9a-fk-or]/g) || []).length

    if (originalColors !== translatedColors) {
      issues.push({
        type: 'special_chars',
        severity: 'warning',
        message: `カラーコードの数が一致しません (原文: ${originalColors}, 翻訳: ${translatedColors})`,
        suggestion: '原文と同じカラーコードを使用してください'
      })
    }

    return issues
  }

  static checkFormatting(original: string, translated: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // 文の始まりと終わりの空白をチェック
    if (original.startsWith(' ') && !translated.startsWith(' ')) {
      issues.push({
        type: 'formatting',
        severity: 'info',
        message: '原文は空白で始まりますが、翻訳は空白で始まっていません',
        suggestion: '原文と同じ形式を保持してください'
      })
    }

    if (original.endsWith(' ') && !translated.endsWith(' ')) {
      issues.push({
        type: 'formatting',
        severity: 'info',
        message: '原文は空白で終わりますが、翻訳は空白で終わっていません',
        suggestion: '原文と同じ形式を保持してください'
      })
    }

    // 句読点の確認
    const originalEndsWithPunct = /[.!?。！？]$/.test(original.trim())
    const translatedEndsWithPunct = /[.!?。！？]$/.test(translated.trim())

    if (originalEndsWithPunct && !translatedEndsWithPunct) {
      issues.push({
        type: 'formatting',
        severity: 'info',
        message: '原文は句読点で終わりますが、翻訳には句読点がありません',
        suggestion: '適切な句読点を追加してください'
      })
    }

    return issues
  }

  static checkConsistency(
    key: string, 
    original: string, 
    translated: string,
    allTranslations: Map<string, string>
  ): QualityIssue[] {
    const issues: QualityIssue[] = []
    const sameOriginalKeys: string[] = []

    // 同じ原文を持つ他のキーを検索
    for (const [otherKey, otherTranslation] of allTranslations.entries()) {
      if (otherKey !== key && otherTranslation === original) {
        sameOriginalKeys.push(otherKey)
      }
    }

    // 同じ原文に対して異なる翻訳がある場合
    if (sameOriginalKeys.length > 0) {
      const differentTranslations = sameOriginalKeys.some(otherKey => {
        const otherTranslated = allTranslations.get(otherKey)
        return otherTranslated && otherTranslated !== translated
      })

      if (differentTranslations) {
        issues.push({
          type: 'consistency',
          severity: 'warning',
          message: '同じ原文に対して異なる翻訳が存在します',
          suggestion: '翻訳の一貫性を保つため、統一した翻訳を使用してください'
        })
      }
    }

    return issues
  }

  static calculateQualityScore(issues: QualityIssue[]): number {
    let score = 100

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 20
          break
        case 'warning':
          score -= 10
          break
        case 'info':
          score -= 5
          break
      }
    }

    return Math.max(0, score)
  }

  static generateQualityReport(
    translations: Array<{ key: string; original: string; translated: string }>
  ): QualityReport {
    const translationMap = new Map<string, string>()
    translations.forEach(t => translationMap.set(t.key, t.original))

    const results = translations.map(({ key, original, translated }) =>
      this.checkTranslation(key, original, translated, translationMap)
    )

    const totalIssues = results.reduce((sum, result) => sum + result.issues.length, 0)
    const errorCount = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'error').length, 0
    )
    const warningCount = results.reduce((sum, result) => 
      sum + result.issues.filter(issue => issue.severity === 'warning').length, 0
    )

    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length

    const summary = {
      placeholderIssues: results.reduce((sum, result) => 
        sum + result.issues.filter(issue => issue.type === 'placeholder_mismatch').length, 0
      ),
      lengthWarnings: results.reduce((sum, result) => 
        sum + result.issues.filter(issue => issue.type === 'length_warning').length, 0
      ),
      emptyTranslations: results.reduce((sum, result) => 
        sum + result.issues.filter(issue => issue.type === 'empty_translation').length, 0
      ),
      formattingIssues: results.reduce((sum, result) => 
        sum + result.issues.filter(issue => issue.type === 'formatting').length, 0
      ),
      consistencyIssues: results.reduce((sum, result) => 
        sum + result.issues.filter(issue => issue.type === 'consistency').length, 0
      )
    }

    return {
      totalChecked: translations.length,
      totalIssues,
      errorCount,
      warningCount,
      averageScore,
      results,
      summary
    }
  }
}