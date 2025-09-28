import React, { useState, useEffect } from 'react'
import { selectFiles } from './utils/webFileUtils'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  Button,
  LinearProgress,
} from '@mui/material'
import {
  Upload,
  Translate,
  Preview,
  Language,
} from '@mui/icons-material'
import DropZone from './components/DropZone'
import FileList from './components/FileList'
import ResourcePackGenerator from './components/ResourcePackGenerator'
import StatisticsPanel from './components/StatisticsPanel'
import PreviewModal from './components/PreviewModal'
import TranslationPanel from './components/TranslationPanel'
import SingleFileExport from './components/SingleFileExport'
import { 
  UploadFab, 
  NotificationSnackbar, 
  LoadingBackdrop 
} from './components/MaterialComponents'
import { useLanguageParser } from './hooks/useLanguageParser'

export interface LanguageFile {
  path: string
  name: string
  content: string
  type: 'json' | 'lang'
}

function App() {
  const [files, setFiles] = useState<LanguageFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info'
  })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [translatedEntries, setTranslatedEntries] = useState<{ key: string; value: string; locale: string }[]>([])

  const {
    parseResults,
    statistics,
    isLoading: isParsingFiles,
    errors: parseErrors,
    warnings: parseWarnings,
    parseFiles,
    validateAllFiles
  } = useLanguageParser()

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity })
  }

  const handleFilesSelected = (newFiles: LanguageFile[]) => {
    setFiles(prev => [...prev, ...newFiles])
    showNotification(`${newFiles.length}個のファイルを追加しました`, 'success')
  }

  const handleRemoveFile = (index: number) => {
    const fileName = files[index].name
    setFiles(prev => prev.filter((_, i) => i !== index))
    showNotification(`${fileName} を削除しました`, 'info')
  }

  const handleSelectFiles = async () => {
    try {
      const selectedFiles = await selectFiles()
      if (selectedFiles && selectedFiles.length > 0) {
        handleFilesSelected(selectedFiles)
      }
    } catch (error) {
      showNotification('ファイル選択でエラーが発生しました', 'error')
    }
  }

  // Auto-parse files when file list changes
  useEffect(() => {
    if (files.length > 0) {
      parseFiles(files).then(results => {
        const successCount = results.filter(r => r.success).length
        const errorCount = results.filter(r => !r.success).length
        
        if (errorCount > 0) {
          showNotification(`${successCount}個のファイルを解析しました（${errorCount}個のエラー）`, 'warning')
        } else {
          showNotification(`${successCount}個のファイルを正常に解析しました`, 'success')
        }

        if (parseErrors.length > 0) {
          console.error('Parse errors:', parseErrors)
        }
        if (parseWarnings.length > 0) {
          console.warn('Parse warnings:', parseWarnings)
        }
      })
    }
  }, [files, parseFiles, parseErrors.length, parseWarnings.length])

  const handleTranslationComplete = (newTranslations: { key: string; value: string; locale: string }[]) => {
    setTranslatedEntries(prev => {
      // Merge with existing translations, replacing duplicates
      const merged = [...prev]
      newTranslations.forEach(newTrans => {
        const existingIndex = merged.findIndex(t => t.key === newTrans.key && t.locale === newTrans.locale)
        if (existingIndex >= 0) {
          merged[existingIndex] = newTrans
        } else {
          merged.push(newTrans)
        }
      })
      return merged
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Translate sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LangPack Studio
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Minecraft Mod Language Pack Creator
          </Typography>
        </Toolbar>
      </AppBar>

      {isProcessing && (
        <LinearProgress sx={{ position: 'absolute', top: 64, left: 0, right: 0, zIndex: 1000 }} />
      )}

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flexGrow: 1 }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={12} xl={2.4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                言語ファイルをインポート
              </Typography>
              
              <DropZone 
                onFilesSelected={handleFilesSelected}
                sx={{ mb: 2, flexGrow: 1 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  onClick={handleSelectFiles}
                  fullWidth
                >
                  ファイルを選択
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} xl={2.4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                インポートされたファイル ({files.length})
              </Typography>
              
              <FileList
                files={files}
                onRemove={handleRemoveFile}
                sx={{ flexGrow: 1, mb: 2 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<Preview />}
                disabled={files.length === 0}
                onClick={() => setPreviewOpen(true)}
                fullWidth
              >
                プレビュー
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} xl={2.4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                翻訳機能
              </Typography>
              
              <TranslationPanel
                parseResults={parseResults}
                files={files}
                onTranslationComplete={handleTranslationComplete}
                onNotification={showNotification}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} xl={2.4}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                リソースパック生成
              </Typography>
              
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                <ResourcePackGenerator
                  files={files}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  translatedEntries={translatedEntries}
                  onComplete={(success, message) => {
                    showNotification(message, success ? 'success' : 'error')
                  }}
                />
              </Box>
              
              {/* 単体ファイル出力ボタン - デバッグ用 */}
              <Box sx={{ 
                borderTop: 2, 
                borderColor: 'error.main',
                bgcolor: 'error.light',
                p: 2,
                mx: -3,
                mb: -3,
                borderRadius: '0 0 4px 4px'
              }}>
                <Typography variant="h6" color="white" gutterBottom>
                  🔥 単体ファイル出力機能
                </Typography>
                <SingleFileExport
                  parseResults={parseResults}
                  translatedEntries={translatedEntries}
                  onNotification={showNotification}
                />
                <Typography variant="caption" color="white" sx={{ mt: 1, display: 'block' }}>
                  DEBUG: parseResults={parseResults.length}, translatedEntries={translatedEntries.length}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} xl={2.4}>
            <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                統計情報
              </Typography>
              
              <StatisticsPanel
                statistics={statistics}
                errors={parseErrors}
                warnings={parseWarnings}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <UploadFab 
        onUpload={handleSelectFiles}
        disabled={isProcessing}
      />

      <LoadingBackdrop 
        open={isProcessing}
        message="リソースパックを生成中..."
      />

      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        parseResults={parseResults}
        files={files}
      />
    </Box>
  )
}

export default App