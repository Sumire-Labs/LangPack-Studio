import { LanguageFile } from '../App'

export interface ParsedLanguageEntry {
  key: string
  value: string
  category?: string
  namespace?: string
}

export interface ParseResult {
  success: boolean
  entries: ParsedLanguageEntry[]
  entryCount: number
  detectedNamespace?: string
  detectedLocale?: string
  errors: string[]
  warnings: string[]
}

export class LanguageParser {
  static parseFile(file: LanguageFile): ParseResult {
    const result: ParseResult = {
      success: false,
      entries: [],
      entryCount: 0,
      errors: [],
      warnings: []
    }

    try {
      if (file.type === 'json' || file.name.endsWith('.json')) {
        return this.parseJsonFile(file, result)
      } else if (file.type === 'lang' || file.name.endsWith('.lang')) {
        return this.parseLangFile(file, result)
      } else {
        result.errors.push('Unsupported file type')
        return result
      }
    } catch (error) {
      result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  private static parseJsonFile(file: LanguageFile, result: ParseResult): ParseResult {
    try {
      const jsonData = JSON.parse(file.content)
      
      if (typeof jsonData !== 'object' || jsonData === null) {
        result.errors.push('JSON file must contain an object')
        return result
      }

      const entries: ParsedLanguageEntry[] = []
      const namespaces = new Set<string>()

      for (const [key, value] of Object.entries(jsonData)) {
        if (typeof value !== 'string') {
          result.warnings.push(`Key "${key}" has non-string value: ${typeof value}`)
          continue
        }

        const entry: ParsedLanguageEntry = {
          key,
          value,
          ...this.analyzeKey(key)
        }

        if (entry.namespace) {
          namespaces.add(entry.namespace)
        }

        entries.push(entry)
      }

      result.entries = entries
      result.entryCount = entries.length
      result.success = true

      // Auto-detect namespace (most common one)
      if (namespaces.size > 0) {
        const namespaceCounts = new Map<string, number>()
        entries.forEach(entry => {
          if (entry.namespace) {
            namespaceCounts.set(entry.namespace, (namespaceCounts.get(entry.namespace) || 0) + 1)
          }
        })

        const mostCommon = Array.from(namespaceCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]
        
        result.detectedNamespace = mostCommon?.[0]
      }

      // Auto-detect locale from filename
      result.detectedLocale = this.detectLocaleFromFilename(file.name)

      if (namespaces.size > 1) {
        result.warnings.push(`Multiple namespaces detected: ${Array.from(namespaces).join(', ')}`)
      }

    } catch (error) {
      result.errors.push(`Invalid JSON format: ${error instanceof Error ? error.message : 'Parse error'}`)
    }

    return result
  }

  private static parseLangFile(file: LanguageFile, result: ParseResult): ParseResult {
    const lines = file.content.split('\n')
    const entries: ParsedLanguageEntry[] = []
    const namespaces = new Set<string>()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue
      }

      // Parse key=value format
      const equalIndex = line.indexOf('=')
      if (equalIndex === -1) {
        result.warnings.push(`Line ${i + 1}: Invalid format, expected key=value`)
        continue
      }

      const key = line.substring(0, equalIndex).trim()
      const value = line.substring(equalIndex + 1).trim()

      if (!key) {
        result.warnings.push(`Line ${i + 1}: Empty key`)
        continue
      }

      const entry: ParsedLanguageEntry = {
        key,
        value,
        ...this.analyzeKey(key)
      }

      if (entry.namespace) {
        namespaces.add(entry.namespace)
      }

      entries.push(entry)
    }

    result.entries = entries
    result.entryCount = entries.length
    result.success = true

    // Auto-detect namespace
    if (namespaces.size > 0) {
      const namespaceCounts = new Map<string, number>()
      entries.forEach(entry => {
        if (entry.namespace) {
          namespaceCounts.set(entry.namespace, (namespaceCounts.get(entry.namespace) || 0) + 1)
        }
      })

      const mostCommon = Array.from(namespaceCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]
      
      result.detectedNamespace = mostCommon?.[0]
    }

    // Auto-detect locale from filename
    result.detectedLocale = this.detectLocaleFromFilename(file.name)

    if (namespaces.size > 1) {
      result.warnings.push(`Multiple namespaces detected: ${Array.from(namespaces).join(', ')}`)
    }

    return result
  }

  private static analyzeKey(key: string): { category?: string; namespace?: string } {
    // Minecraft naming convention: category.namespace.item_name
    // or category.namespace.subcategory.item_name
    const parts = key.split('.')
    
    if (parts.length >= 3) {
      return {
        category: parts[0],
        namespace: parts[1]
      }
    } else if (parts.length === 2) {
      return {
        category: parts[0]
      }
    }

    return {}
  }

  private static detectLocaleFromFilename(filename: string): string | undefined {
    // Extract locale from filename like "en_us.json", "ja_jp.lang", etc.
    const nameWithoutExt = filename.replace(/\.(json|lang)$/, '')
    const localeRegex = /^([a-z]{2}_[a-z]{2})$/i
    
    const match = nameWithoutExt.match(localeRegex)
    return match ? match[1] : undefined
  }

  static validateEntries(entries: ParsedLanguageEntry[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    const keySet = new Set<string>()

    for (const entry of entries) {
      // Check for duplicate keys
      if (keySet.has(entry.key)) {
        errors.push(`Duplicate key found: ${entry.key}`)
      } else {
        keySet.add(entry.key)
      }

      // Check for empty values
      if (!entry.value.trim()) {
        warnings.push(`Empty value for key: ${entry.key}`)
      }

      // Check for suspicious formatting
      if (entry.value.includes('\\n') && !entry.value.includes('\n')) {
        warnings.push(`Key "${entry.key}" contains literal \\n instead of newline`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  static getStatistics(parseResults: ParseResult[]): {
    totalFiles: number
    totalEntries: number
    namespaces: string[]
    locales: string[]
    categories: { [key: string]: number }
  } {
    const namespaces = new Set<string>()
    const locales = new Set<string>()
    const categories = new Map<string, number>()
    let totalEntries = 0

    parseResults.forEach(result => {
      totalEntries += result.entryCount

      if (result.detectedNamespace) {
        namespaces.add(result.detectedNamespace)
      }

      if (result.detectedLocale) {
        locales.add(result.detectedLocale)
      }

      result.entries.forEach(entry => {
        if (entry.category) {
          categories.set(entry.category, (categories.get(entry.category) || 0) + 1)
        }
      })
    })

    return {
      totalFiles: parseResults.length,
      totalEntries,
      namespaces: Array.from(namespaces).sort(),
      locales: Array.from(locales).sort(),
      categories: Object.fromEntries(categories)
    }
  }
}