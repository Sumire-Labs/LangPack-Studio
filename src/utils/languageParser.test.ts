import { describe, it, expect } from 'vitest'
import { LanguageParser } from './languageParser'
import { LanguageFile } from '../App'

describe('LanguageParser', () => {
  describe('parseFile with different locales', () => {
    it('should detect locale from lowercase filename', () => {
      const file: LanguageFile = { name: 'en_us.json', content: '{}', type: 'json' }
      const result = LanguageParser.parseFile(file)
      expect(result.detectedLocale).toBe('en_us')
    })

    it('should detect locale from uppercase filename', () => {
      const file: LanguageFile = { name: 'en_US.json', content: '{}', type: 'json' }
      const result = LanguageParser.parseFile(file)
      expect(result.detectedLocale).toBe('en_US')
    })

    it('should return undefined for invalid filename', () => {
      const file: LanguageFile = { name: 'en-us.json', content: '{}', type: 'json' }
      const result = LanguageParser.parseFile(file)
      expect(result.detectedLocale).toBe(undefined)
    })
  })
})
