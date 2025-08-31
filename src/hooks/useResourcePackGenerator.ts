import { useState, useCallback } from 'react'
import { LanguageFile } from '../App'
import { 
  ResourcePackGenerator, 
  ResourcePackOptions, 
  ResourcePackResult 
} from '../utils/resourcePackGenerator'

export interface ResourcePackGeneratorState {
  isGenerating: boolean
  lastResult?: ResourcePackResult
  generationHistory: ResourcePackResult[]
}

export const useResourcePackGenerator = () => {
  const [state, setState] = useState<ResourcePackGeneratorState>({
    isGenerating: false,
    generationHistory: []
  })

  const generateResourcePack = useCallback(async (
    files: LanguageFile[],
    options: Partial<ResourcePackOptions> = {}
  ): Promise<ResourcePackResult> => {
    setState(prev => ({ ...prev, isGenerating: true }))

    try {
      const result = await ResourcePackGenerator.generateResourcePack(files, options)
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastResult: result,
        generationHistory: [result, ...prev.generationHistory.slice(0, 9)] // Keep last 10 results
      }))

      return result
    } catch (error) {
      const errorResult: ResourcePackResult = {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown generation error'],
        warnings: [],
        generatedFiles: []
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        lastResult: errorResult,
        generationHistory: [errorResult, ...prev.generationHistory.slice(0, 9)]
      }))

      return errorResult
    }
  }, [])

  const saveResourcePack = useCallback(async (
    blob: Blob,
    filename?: string
  ): Promise<boolean> => {
    try {
      return await ResourcePackGenerator.saveResourcePack(blob, filename)
    } catch (error) {
      console.error('Failed to save resource pack:', error)
      return false
    }
  }, [])

  const generateAndSave = useCallback(async (
    files: LanguageFile[],
    options: Partial<ResourcePackOptions> = {},
    filename?: string
  ): Promise<{ success: boolean; result: ResourcePackResult; saved?: boolean }> => {
    const result = await generateResourcePack(files, options)
    
    if (!result.success || !result.zipBlob) {
      return { success: false, result }
    }

    const saved = await saveResourcePack(result.zipBlob, filename)
    return { success: result.success, result, saved }
  }, [generateResourcePack, saveResourcePack])

  const validateLastResult = useCallback((): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } | null => {
    if (!state.lastResult || !state.lastResult.success) {
      return null
    }

    return ResourcePackGenerator.validateResourcePackStructure(state.lastResult.generatedFiles)
  }, [state.lastResult])

  const getGenerationSummary = useCallback((result?: ResourcePackResult) => {
    const targetResult = result || state.lastResult
    if (!targetResult) return null

    const summary = {
      success: targetResult.success,
      totalFiles: targetResult.generatedFiles.length,
      languageFiles: targetResult.generatedFiles.filter(f => f.type === 'language').length,
      namespaces: [...new Set(targetResult.generatedFiles
        .filter(f => f.namespace)
        .map(f => f.namespace))],
      locales: [...new Set(targetResult.generatedFiles
        .filter(f => f.locale)
        .map(f => f.locale))],
      hasMetaFile: targetResult.generatedFiles.some(f => f.path === 'pack.mcmeta'),
      errors: targetResult.errors,
      warnings: targetResult.warnings
    }

    return summary
  }, [state.lastResult])

  const clearHistory = useCallback(() => {
    setState({
      isGenerating: false,
      generationHistory: []
    })
  }, [])

  return {
    ...state,
    generateResourcePack,
    saveResourcePack,
    generateAndSave,
    validateLastResult,
    getGenerationSummary,
    clearHistory
  }
}