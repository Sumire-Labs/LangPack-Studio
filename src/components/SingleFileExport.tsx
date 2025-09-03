import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  Alert,
  RadioGroup,
  Radio,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material'
import {
  Download,
  FileDownload,
  Code,
  Description,
  Close,
  ContentCopy,
  Preview,
  CompareArrows
} from '@mui/icons-material'
import { SingleFileExporter, ExportEntry } from '../utils/singleFileExporter'
import { ParseResult } from '../utils/languageParser'

interface SingleFileExportProps {
  parseResults: ParseResult[]
  translatedEntries?: { key: string; value: string; locale: string }[]
  onNotification?: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void
}

const SingleFileExport: React.FC<SingleFileExportProps> = ({
  parseResults,
  translatedEntries = [],
  onNotification
}) => {
  const [open, setOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'lang'>('json')
  const [exportType, setExportType] = useState<'original' | 'translated' | 'comparison'>('original')
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all')
  const [selectedLocale, setSelectedLocale] = useState<string>('en_us')
  const [includeMetadata, setIncludeMetadata] = useState(false)
  const [sortKeys, setSortKeys] = useState(true)
  const [prettify, setPrettify] = useState(true)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // データ準備
  const allEntries = parseResults.flatMap(result => result.entries)
  const namespaces = ['all', ...new Set(allEntries.map(e => e.namespace).filter(Boolean))]
  const locales = new Set<string>()
  
  // 元の言語を収集
  parseResults.forEach(result => {
    if (result.detectedLocale) locales.add(result.detectedLocale)
  })
  
  // 翻訳先言語を収集
  translatedEntries.forEach(entry => {
    if (entry.locale) locales.add(entry.locale)
  })
  
  if (locales.size === 0) {
    locales.add('en_us')
  }

  const handleExport = () => {
    try {
      let entries: ExportEntry[] = []
      let fileName = ''

      // エクスポート対象のエントリーを準備
      if (exportType === 'original') {
        // オリジナルエントリー
        entries = allEntries
          .filter(e => selectedNamespace === 'all' || e.namespace === selectedNamespace)
          .map(e => ({
            key: e.key,
            value: e.value,
            namespace: e.namespace,
            category: e.category
          }))
        
        const namespace = selectedNamespace === 'all' ? 'minecraft' : selectedNamespace
        fileName = SingleFileExporter.generateFileName(exportFormat, selectedLocale, namespace, false)
        
      } else if (exportType === 'translated') {
        // 翻訳済みエントリー
        const translatedMap = new Map<string, string>()
        translatedEntries.forEach(e => {
          if (e.locale === selectedLocale) {
            translatedMap.set(e.key, e.value)
          }
        })
        
        entries = allEntries
          .filter(e => selectedNamespace === 'all' || e.namespace === selectedNamespace)
          .filter(e => translatedMap.has(e.key))
          .map(e => ({
            key: e.key,
            value: translatedMap.get(e.key)!,
            namespace: e.namespace,
            category: e.category
          }))
        
        const namespace = selectedNamespace === 'all' ? 'minecraft' : selectedNamespace
        fileName = SingleFileExporter.generateFileName(exportFormat, selectedLocale, namespace, true)
        
      } else if (exportType === 'comparison') {
        // 比較用CSV
        const originalEntries = allEntries
          .filter(e => selectedNamespace === 'all' || e.namespace === selectedNamespace)
          .map(e => ({
            key: e.key,
            value: e.value,
            namespace: e.namespace,
            category: e.category
          }))
        
        const translatedMap = new Map<string, string>()
        translatedEntries.forEach(e => {
          if (e.locale === selectedLocale) {
            translatedMap.set(e.key, e.value)
          }
        })
        
        const translatedExportEntries = originalEntries.map(e => ({
          ...e,
          value: translatedMap.get(e.key) || e.value
        }))
        
        const content = SingleFileExporter.exportComparison(
          originalEntries,
          translatedExportEntries,
          'csv'
        )
        
        fileName = `comparison_${selectedLocale}.csv`
        SingleFileExporter.downloadFile(content, fileName, 'text/csv')
        
        onNotification?.(`比較ファイルをエクスポートしました: ${fileName}`, 'success')
        setOpen(false)
        return
      }

      if (entries.length === 0) {
        onNotification?.('エクスポートするエントリーがありません', 'warning')
        return
      }

      // エクスポートオプション
      const options = {
        format: exportFormat,
        locale: selectedLocale,
        namespace: selectedNamespace === 'all' ? undefined : selectedNamespace,
        includeMetadata,
        prettify,
        sortKeys
      }

      // エクスポート実行
      const { content, stats } = SingleFileExporter.exportWithStats(entries, exportFormat, options)
      
      // ダウンロード
      const mimeType = exportFormat === 'json' ? 'application/json' : 'text/plain'
      SingleFileExporter.downloadFile(content, fileName, mimeType)
      
      onNotification?.(
        `ファイルをエクスポートしました: ${fileName} (${stats.totalEntries}エントリー)`,
        'success'
      )
      
      setOpen(false)
    } catch (error) {
      onNotification?.(
        `エクスポートに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    }
  }

  const handlePreview = () => {
    try {
      let entries: ExportEntry[] = []
      
      if (exportType === 'original') {
        entries = allEntries
          .filter(e => selectedNamespace === 'all' || e.namespace === selectedNamespace)
          .slice(0, 10) // プレビューは最初の10件のみ
          .map(e => ({
            key: e.key,
            value: e.value,
            namespace: e.namespace,
            category: e.category
          }))
      } else if (exportType === 'translated') {
        const translatedMap = new Map<string, string>()
        translatedEntries.forEach(e => {
          if (e.locale === selectedLocale) {
            translatedMap.set(e.key, e.value)
          }
        })
        
        entries = allEntries
          .filter(e => selectedNamespace === 'all' || e.namespace === selectedNamespace)
          .filter(e => translatedMap.has(e.key))
          .slice(0, 10)
          .map(e => ({
            key: e.key,
            value: translatedMap.get(e.key)!,
            namespace: e.namespace,
            category: e.category
          }))
      }

      const options = {
        format: exportFormat,
        locale: selectedLocale,
        namespace: selectedNamespace === 'all' ? undefined : selectedNamespace,
        includeMetadata,
        prettify,
        sortKeys
      }

      const content = exportFormat === 'json'
        ? SingleFileExporter.exportToJSON(entries, options)
        : SingleFileExporter.exportToLANG(entries, options)
      
      setPreviewContent(content + '\n\n... (最初の10件のみ表示)')
      setShowPreview(true)
    } catch (error) {
      onNotification?.('プレビューの生成に失敗しました', 'error')
    }
  }

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewContent)
    onNotification?.('クリップボードにコピーしました', 'success')
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownload />}
        onClick={() => setOpen(true)}
        size="small"
      >
        単体ファイル出力
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">単体ファイルエクスポート</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* エクスポート種別 */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              エクスポート種別
            </Typography>
            <RadioGroup
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
            >
              <FormControlLabel 
                value="original" 
                control={<Radio size="small" />} 
                label="オリジナル（翻訳前）" 
              />
              <FormControlLabel 
                value="translated" 
                control={<Radio size="small" />} 
                label="翻訳済み" 
                disabled={translatedEntries.length === 0}
              />
              <FormControlLabel 
                value="comparison" 
                control={<Radio size="small" />} 
                label="比較用CSV" 
                disabled={translatedEntries.length === 0}
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* 形式選択 */}
          {exportType !== 'comparison' && (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>出力形式</InputLabel>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'lang')}
                  label="出力形式"
                >
                  <MenuItem value="json">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Code />
                      JSON形式 (.json)
                    </Box>
                  </MenuItem>
                  <MenuItem value="lang">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Description />
                      LANG形式 (.lang)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {/* 名前空間選択 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>名前空間</InputLabel>
            <Select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              label="名前空間"
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

          {/* 言語選択 */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>言語</InputLabel>
            <Select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              label="言語"
            >
              {Array.from(locales).map(locale => (
                <MenuItem key={locale} value={locale}>
                  {locale}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          {/* オプション */}
          {exportType !== 'comparison' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                エクスポートオプション
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    size="small"
                  />
                }
                label="メタデータを含める"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={sortKeys}
                    onChange={(e) => setSortKeys(e.target.checked)}
                    size="small"
                  />
                }
                label="キーをソート"
              />
              
              {exportFormat === 'json' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={prettify}
                      onChange={(e) => setPrettify(e.target.checked)}
                      size="small"
                    />
                  }
                  label="整形する"
                />
              )}
            </Box>
          )}

          {/* 統計情報 */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              エクスポート対象: {
                allEntries.filter(e => 
                  selectedNamespace === 'all' || e.namespace === selectedNamespace
                ).length
              } エントリー
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          {exportType !== 'comparison' && (
            <Button 
              onClick={handlePreview}
              startIcon={<Preview />}
            >
              プレビュー
            </Button>
          )}
          <Button 
            onClick={handleExport} 
            variant="contained"
            startIcon={<Download />}
          >
            エクスポート
          </Button>
        </DialogActions>
      </Dialog>

      {/* プレビューダイアログ */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">プレビュー</Typography>
            <Box>
              <IconButton onClick={handleCopyPreview} size="small">
                <Tooltip title="コピー">
                  <ContentCopy />
                </Tooltip>
              </IconButton>
              <IconButton onClick={() => setShowPreview(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              backgroundColor: 'grey.50',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            {previewContent}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SingleFileExport