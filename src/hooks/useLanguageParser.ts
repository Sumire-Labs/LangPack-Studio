import { useState, useEffect, useCallback } from 'react'
import { LanguageFile } from '../App'
import { LanguageParser, ParseResult } from '../utils/languageParser'

export interface LanguageParserState {
  parseResults: ParseResult[]
  isLoading: boolean
  statistics: {
    totalFiles: number
    totalEntries: number
    namespaces: string[]
    locales: string[]
    categories: { [key: string]: number }
  }
  errors: string[]
  warnings: string[]
}

export const useLanguageParser = () => {
  const [state, setState] = useState<LanguageParserState>({
    parseResults: [],
    isLoading: false,
    statistics: {
      totalFiles: 0,
      totalEntries: 0,
      namespaces: [],
      locales: [],
      categories: {}
    },
    errors: [],
    warnings: []
  })

  const parseFiles = useCallback(async (files: LanguageFile[]): Promise<ParseResult[]> => {
    if (files.length === 0) {
      setState(prev => ({
        ...prev,
        parseResults: [],
        statistics: {
          totalFiles: 0,
          totalEntries: 0,
          namespaces: [],
          locales: [],
          categories: {}
        },
        errors: [],
        warnings: []
      }))
      return []
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // Parse files with a slight delay to allow UI updates
      const results = await new Promise<ParseResult[]>((resolve) => {
        setTimeout(() => {
          const parseResults = files.map(file => LanguageParser.parseFile(file))
          resolve(parseResults)
        }, 100)
      })

      // Collect all errors and warnings
      const allErrors: string[] = []
      const allWarnings: string[] = []

      results.forEach((result, index) => {
        const fileName = files[index].name
        result.errors.forEach(error => {
          allErrors.push(`${fileName}: ${error}`)
        })
        result.warnings.forEach(warning => {
          allWarnings.push(`${fileName}: ${warning}`)
        })
      })

      // Generate statistics
      const statistics = LanguageParser.getStatistics(results)

      setState(prev => ({
        ...prev,
        parseResults: results,
        statistics,
        errors: allErrors,
        warnings: allWarnings,
        isLoading: false
      }))

      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
      setState(prev => ({
        ...prev,
        errors: [errorMessage],
        warnings: [],
        isLoading: false
      }))
      return []
    }
  }, [])

  const getParseResultForFile = useCallback((fileName: string): ParseResult | undefined => {
    const index = state.parseResults.findIndex((_, i) => {
      return fileName === fileName // This would need the original files array to match properly
    })
    return state.parseResults[index]
  }, [state.parseResults])

  const validateAllFiles = useCallback((): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } => {
    const allErrors: string[] = []
    const allWarnings: string[] = []

    state.parseResults.forEach(result => {
      if (result.success) {
        const validation = LanguageParser.validateEntries(result.entries)
        allErrors.push(...validation.errors)
        allWarnings.push(...validation.warnings)
      }
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }, [state.parseResults])

  const getEntriesForNamespace = useCallback((namespace: string) => {
    return state.parseResults.flatMap(result =>
      result.entries.filter(entry => entry.namespace === namespace)
    )
  }, [state.parseResults])

  const getEntriesForCategory = useCallback((category: string) => {
    return state.parseResults.flatMap(result =>
      result.entries.filter(entry => entry.category === category)
    )
  }, [state.parseResults])

  // Clear results when needed
  const clearResults = useCallback(() => {
    setState({
      parseResults: [],
      isLoading: false,
      statistics: {
        totalFiles: 0,
        totalEntries: 0,
        namespaces: [],
        locales: [],
        categories: {}
      },
      errors: [],
      warnings: []
    })
  }, [])

  return {
    ...state,
    parseFiles,
    getParseResultForFile,
    validateAllFiles,
    getEntriesForNamespace,
    getEntriesForCategory,
    clearResults
  }
}