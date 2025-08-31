import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Translate,
  SwapHoriz,
  PlayArrow,
  Stop,
  Edit,
  Save,
  Delete,
  ExpandMore,
  Settings,
  CheckCircle,
  Error as ErrorIcon,
  Warning
} from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'
import { ParseResult } from '../utils/languageParser'

interface TranslationPanelProps {
  parseResults: ParseResult[]
  files: { name: string; type?: string }[]
  onTranslationComplete?: (translatedEntries: { key: string; value: string; locale: string }[]) => void
  onNotification?: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  parseResults,
  files,
  onTranslationComplete,
  onNotification
}) => {
  const {
    isTranslating,
    isBatchTranslating,
    progress,
    lastBatchResult,
    selectedFromLanguage,
    selectedToLanguage,
    translationService,
    translationHistory,
    errors,
    geminiApiKey,
    batchTranslate,
    setTranslationService,
    setLanguages,
    updateGeminiApiKey,
    getSupportedLanguages,
    canTranslate,
    clearErrors,
    getLanguageName
  } = useTranslation()

  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showTranslationDialog, setShowTranslationDialog] = useState(false)
  const [editingTranslations, setEditingTranslations] = useState<{ [key: string]: string }>({})
  const [autoApprove, setAutoApprove] = useState(false)
  const [excludePatterns, setExcludePatterns] = useState<string[]>(['%%', '%s', '%d', '\\n'])

  const supportedLanguages = getSupportedLanguages()
  const allEntries = parseResults.flatMap(result => result.entries)
  
  // Get unique namespaces and categories
  const namespaces = ['all', ...new Set(allEntries.map(e => e.namespace).filter(Boolean))]
  const categories = ['all', ...new Set(allEntries.map(e => e.category).filter(Boolean))]

  // Filter entries based on selection
  const filteredEntries = allEntries.filter(entry => {
    const matchesNamespace = selectedNamespace === 'all' || entry.namespace === selectedNamespace
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
    return matchesNamespace && matchesCategory
  })

  const handleLanguageSwap = () => {
    setLanguages(selectedToLanguage, selectedFromLanguage)
  }

  const handleStartTranslation = async () => {
    if (!canTranslate() || filteredEntries.length === 0) return

    clearErrors()
    
    const entriesToTranslate = filteredEntries
      .filter(entry => {
        // Skip entries that contain excluded patterns
        return !excludePatterns.some(pattern => 
          entry.value.includes(pattern) || entry.key.includes(pattern)
        )
      })
      .map(entry => ({
        key: entry.key,
        text: entry.value
      }))

    if (entriesToTranslate.length === 0) {
      onNotification?.('翻訳対象のエントリーがありません', 'warning')
      return
    }

    try {
      const result = await batchTranslate(entriesToTranslate)
      
      if (result) {
        if (result.success) {
          onNotification?.(
            `${result.totalProcessed}個のエントリーを翻訳しました（失敗: ${result.totalFailed}個）`, 
            result.totalFailed > 0 ? 'warning' : 'success'
          )
          
          if (autoApprove && result.totalFailed === 0) {
            // Auto-approve and apply translations
            const translatedEntries = result.translations.map(t => ({
              key: t.key,
              value: t.translated,
              locale: selectedToLanguage
            }))
            onTranslationComplete?.(translatedEntries)
          } else {
            // Show dialog for manual review
            const editingMap: { [key: string]: string } = {}
            result.translations.forEach(t => {
              editingMap[t.key] = t.translated
            })
            setEditingTranslations(editingMap)
            setShowTranslationDialog(true)
          }
        } else {
          onNotification?.('翻訳に失敗しました', 'error')
        }
      }
    } catch (error) {
      onNotification?.(`翻訳エラー: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleApplyTranslations = () => {
    const translatedEntries = Object.entries(editingTranslations).map(([key, value]) => ({
      key,
      value,
      locale: selectedToLanguage
    }))
    
    onTranslationComplete?.(translatedEntries)
    setShowTranslationDialog(false)
    onNotification?.(`${translatedEntries.length}個の翻訳を適用しました`, 'success')
  }

  const handleEditTranslation = (key: string, value: string) => {
    setEditingTranslations(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const hasData = parseResults.length > 0 && allEntries.length > 0

  if (!hasData) {
    return (
      <Card variant="outlined">
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Translate sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            翻訳機能
          </Typography>
          <Typography variant="body2" color="text.disabled">
            まず言語ファイルをインポートしてください
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      {/* Translation Settings */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Translate color="primary" />
            自動翻訳
          </Typography>
          
          {/* Language Selection */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>翻訳元</InputLabel>
              <Select
                value={selectedFromLanguage}
                onChange={(e) => setLanguages(e.target.value, selectedToLanguage)}
                label="翻訳元"
              >
                {supportedLanguages.map(lang => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton onClick={handleLanguageSwap} color="primary">
              <SwapHoriz />
            </IconButton>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>翻訳先</InputLabel>
              <Select
                value={selectedToLanguage}
                onChange={(e) => setLanguages(selectedFromLanguage, e.target.value)}
                label="翻訳先"
              >
                {supportedLanguages.map(lang => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mod</InputLabel>
              <Select
                value={selectedNamespace}
                onChange={(e) => setSelectedNamespace(e.target.value)}
                label="Mod"
              >
                {namespaces.map(ns => (
                  <MenuItem key={ns} value={ns}>
                    {ns === 'all' ? '全て' : ns} 
                    {ns !== 'all' && (
                      <Chip 
                        label={allEntries.filter(e => e.namespace === ns).length} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>カテゴリー</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="カテゴリー"
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? '全て' : cat}
                    {cat !== 'all' && (
                      <Chip 
                        label={allEntries.filter(e => e.category === cat).length} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Translation Options */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Settings sx={{ mr: 1 }} />
              <Typography variant="subtitle2">翻訳設定</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
                <InputLabel>翻訳サービス</InputLabel>
                <Select
                  value={translationService}
                  onChange={(e) => setTranslationService(e.target.value as any)}
                  label="翻訳サービス"
                >
                  <MenuItem value="google">Google Translate (無料)</MenuItem>
                  <MenuItem value="gemini">Google Gemini (要APIキー)</MenuItem>
                  <MenuItem value="libretranslate">LibreTranslate (無料)</MenuItem>
                </Select>
              </FormControl>

              {/* Gemini API Key Input */}
              {translationService === 'gemini' && (
                <TextField
                  fullWidth
                  size="small"
                  label="Gemini API Key"
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => updateGeminiApiKey(e.target.value)}
                  placeholder="Google AI Studio で取得したAPIキーを入力"
                  helperText="https://makersuite.google.com/app/apikey でAPIキーを取得できます"
                  sx={{ mb: 2 }}
                />
              )}
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                  />
                }
                label="翻訳結果を自動承認"
                sx={{ display: 'block', mb: 1 }}
              />
            </AccordionDetails>
          </Accordion>

          {/* Translation Progress */}
          {isBatchTranslating && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                翻訳中... {Math.round(progress)}%
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearErrors}>
              <AlertTitle>翻訳エラー</AlertTitle>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          )}

          {/* Action Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={isBatchTranslating ? <Stop /> : <PlayArrow />}
              onClick={handleStartTranslation}
              disabled={!canTranslate() || filteredEntries.length === 0}
              fullWidth
            >
              {isBatchTranslating 
                ? `翻訳中 (${Math.round(progress)}%)` 
                : `${filteredEntries.length}個のエントリーを翻訳`
              }
            </Button>
          </Box>

          {/* Summary */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`${filteredEntries.length} 翻訳対象`} 
              size="small" 
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`${getLanguageName(selectedFromLanguage)} → ${getLanguageName(selectedToLanguage)}`} 
              size="small" 
              color="secondary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Last Result Summary */}
      {lastBatchResult && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              最新の翻訳結果
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              {lastBatchResult.success ? (
                <Chip 
                  icon={<CheckCircle />}
                  label="成功" 
                  size="small" 
                  color="success"
                />
              ) : (
                <Chip 
                  icon={<ErrorIcon />}
                  label="失敗" 
                  size="small" 
                  color="error"
                />
              )}
              
              <Chip 
                label={`${lastBatchResult.totalProcessed} 成功`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
              
              {lastBatchResult.totalFailed > 0 && (
                <Chip 
                  label={`${lastBatchResult.totalFailed} 失敗`} 
                  size="small" 
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Translation Review Dialog */}
      <Dialog 
        open={showTranslationDialog} 
        onClose={() => setShowTranslationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>翻訳結果の確認・編集</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            翻訳結果を確認し、必要に応じて編集してください。
          </Typography>
          
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {Object.entries(editingTranslations).map(([key, value], index) => (
              <ListItem key={key} divider={index < Object.entries(editingTranslations).length - 1}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    {key}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={value}
                    onChange={(e) => handleEditTranslation(key, e.target.value)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTranslationDialog(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleApplyTranslations}
            variant="contained"
            startIcon={<Save />}
          >
            適用 ({Object.keys(editingTranslations).length})
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TranslationPanel