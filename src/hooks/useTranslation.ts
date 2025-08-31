import { useState, useCallback } from 'react'
import { 
  translationManager, 
  TranslationRequest, 
  TranslationResult, 
  BatchTranslationRequest, 
  BatchTranslationResult,
  TranslationService,
  SUPPORTED_LANGUAGES,
  LanguageOption
} from '../utils/translationService'

export interface TranslationState {
  isTranslating: boolean
  isBatchTranslating: boolean
  progress: number
  lastResult?: TranslationResult
  lastBatchResult?: BatchTranslationResult
  selectedFromLanguage: string
  selectedToLanguage: string
  translationService: TranslationService
  translationHistory: TranslationResult[]
  errors: string[]
}

export const useTranslation = () => {
  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    isBatchTranslating: false,
    progress: 0,
    selectedFromLanguage: 'en',
    selectedToLanguage: 'ja',
    translationService: 'google',
    translationHistory: [],
    errors: []
  })

  const setTranslationService = useCallback((service: TranslationService) => {
    translationManager.setService(service)
    setState(prev => ({ ...prev, translationService: service }))
  }, [])

  const setLanguages = useCallback((from: string, to: string) => {
    setState(prev => ({
      ...prev,
      selectedFromLanguage: from,
      selectedToLanguage: to
    }))
  }, [])

  const translate = useCallback(async (text: string): Promise<TranslationResult | null> => {
    if (!text.trim()) return null

    setState(prev => ({ ...prev, isTranslating: true, errors: [] }))

    try {
      const request: TranslationRequest = {
        text,
        from: state.selectedFromLanguage,
        to: state.selectedToLanguage
      }

      const result = await translationManager.translate(request)

      setState(prev => ({
        ...prev,
        isTranslating: false,
        lastResult: result,
        translationHistory: [result, ...prev.translationHistory.slice(0, 9)] // Keep last 10
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed'
      setState(prev => ({
        ...prev,
        isTranslating: false,
        errors: [errorMessage]
      }))
      return null
    }
  }, [state.selectedFromLanguage, state.selectedToLanguage])

  const batchTranslate = useCallback(async (
    entries: { key: string; text: string }[]
  ): Promise<BatchTranslationResult | null> => {
    if (entries.length === 0) return null

    setState(prev => ({ 
      ...prev, 
      isBatchTranslating: true, 
      progress: 0, 
      errors: [] 
    }))

    try {
      const request: BatchTranslationRequest = {
        entries,
        from: state.selectedFromLanguage,
        to: state.selectedToLanguage
      }

      const result = await translationManager.batchTranslate(request, (progress) => {
        setState(prev => ({ ...prev, progress }))
      })

      setState(prev => ({
        ...prev,
        isBatchTranslating: false,
        progress: 100,
        lastBatchResult: result
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch translation failed'
      setState(prev => ({
        ...prev,
        isBatchTranslating: false,
        progress: 0,
        errors: [errorMessage]
      }))
      return null
    }
  }, [state.selectedFromLanguage, state.selectedToLanguage])

  const testTranslationService = useCallback(async (service?: TranslationService): Promise<boolean> => {
    try {
      return await translationManager.testService(service)
    } catch (error) {
      return false
    }
  }, [])

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      translationHistory: [],
      lastResult: undefined,
      lastBatchResult: undefined
    }))
  }, [])

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }))
  }, [])

  // Helper functions
  const getLanguageName = useCallback((code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
    return language ? language.name : code
  }, [])

  const getLanguageNativeName = useCallback((code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
    return language ? language.nativeName : code
  }, [])

  const getSupportedLanguages = useCallback((): LanguageOption[] => {
    return SUPPORTED_LANGUAGES
  }, [])

  const canTranslate = useCallback((): boolean => {
    return !state.isTranslating && 
           !state.isBatchTranslating && 
           state.selectedFromLanguage !== state.selectedToLanguage
  }, [state.isTranslating, state.isBatchTranslating, state.selectedFromLanguage, state.selectedToLanguage])

  return {
    ...state,
    translate,
    batchTranslate,
    setTranslationService,
    setLanguages,
    testTranslationService,
    clearHistory,
    clearErrors,
    getLanguageName,
    getLanguageNativeName,
    getSupportedLanguages,
    canTranslate
  }
}