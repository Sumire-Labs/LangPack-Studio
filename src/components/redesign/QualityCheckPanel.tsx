import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  Search,
  ExpandMore,
  Assessment,
  BugReport,
  Speed,
  Psychology,
  Lightbulb,
  Download,
  Refresh
} from '@mui/icons-material'
import { TranslationQualityChecker, QualityReport, QualityCheckResult } from '../../utils/qualityChecker'

interface QualityCheckPanelProps {
  translations: Array<{ key: string; original: string; translated: string }>
  onTranslationUpdate?: (key: string, newTranslation: string) => void
}

const QualityCheckPanel: React.FC<QualityCheckPanelProps> = ({
  translations,
  onTranslationUpdate
}) => {
  const theme = useTheme()
  const [isChecking, setIsChecking] = useState(false)
  const [report, setReport] = useState<QualityReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const runQualityCheck = async () => {
    setIsChecking(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newReport = TranslationQualityChecker.generateQualityReport(translations)
    setReport(newReport)
    setIsChecking(false)
  }

  const filteredResults = useMemo(() => {
    if (!report) return []

    return report.results.filter(result => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!result.key.toLowerCase().includes(searchLower) &&
            !result.originalText.toLowerCase().includes(searchLower) &&
            !result.translatedText.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      // Severity filter
      if (severityFilter !== 'all') {
        if (!result.issues.some(issue => issue.severity === severityFilter)) {
          return false
        }
      }

      // Type filter
      if (typeFilter !== 'all') {
        if (!result.issues.some(issue => issue.type === typeFilter)) {
          return false
        }
      }

      return true
    })
  }, [report, searchTerm, severityFilter, typeFilter])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error': return <ErrorIcon color="error" />
      case 'warning': return <Warning color="warning" />
      case 'info': return <Info color="info" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'placeholder_mismatch': return <BugReport />
      case 'length_warning': return <Speed />
      case 'empty_translation': return <ErrorIcon />
      case 'special_chars': return <Psychology />
      case 'consistency': return <Assessment />
      case 'formatting': return <Lightbulb />
      default: return <Info />
    }
  }

  const downloadReport = () => {
    if (!report) return

    const reportData = {
      timestamp: new Date().toISOString(),
      summary: report,
      details: filteredResults
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], 
      { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quality-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (translations.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Assessment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            品質チェック
          </Typography>
          <Typography variant="body2" color="text.disabled">
            翻訳データがありません
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            翻訳品質チェック
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translations.length}件の翻訳を分析
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {report && (
            <Button
              startIcon={<Download />}
              onClick={downloadReport}
              variant="outlined"
            >
              レポート出力
            </Button>
          )}
          <Button
            startIcon={<Assessment />}
            onClick={runQualityCheck}
            variant="contained"
            disabled={isChecking}
          >
            {isChecking ? 'チェック中...' : '品質チェック実行'}
          </Button>
        </Box>
      </Box>

      {/* Progress */}
      {isChecking && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            翻訳品質をチェック中...
          </Typography>
        </Box>
      )}

      {/* Results Summary */}
      {report && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {Math.round(report.averageScore)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均品質スコア
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                  {report.errorCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  エラー
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning">
                  {report.warningCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  警告
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="info">
                  {report.totalIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  総問題数
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Issue Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                問題の内訳
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip 
                  label={`プレースホルダー: ${report.summary.placeholderIssues}`}
                  color={report.summary.placeholderIssues > 0 ? "error" : "default"}
                  variant="outlined"
                />
                <Chip 
                  label={`文字数: ${report.summary.lengthWarnings}`}
                  color={report.summary.lengthWarnings > 0 ? "warning" : "default"}
                  variant="outlined"
                />
                <Chip 
                  label={`空翻訳: ${report.summary.emptyTranslations}`}
                  color={report.summary.emptyTranslations > 0 ? "error" : "default"}
                  variant="outlined"
                />
                <Chip 
                  label={`書式: ${report.summary.formattingIssues}`}
                  color={report.summary.formattingIssues > 0 ? "info" : "default"}
                  variant="outlined"
                />
                <Chip 
                  label={`一貫性: ${report.summary.consistencyIssues}`}
                  color={report.summary.consistencyIssues > 0 ? "warning" : "default"}
                  variant="outlined"
                />
              </Box>

              {report.averageScore < 70 && (
                <Alert severity="warning">
                  翻訳品質が低下しています。主要な問題を修正することをお勧めします。
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="キーまたはテキストで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 200 }}
                />
                
                <Button
                  variant={severityFilter === 'all' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setSeverityFilter('all')}
                >
                  全て
                </Button>
                <Button
                  variant={severityFilter === 'error' ? 'contained' : 'outlined'}
                  size="small"
                  color="error"
                  onClick={() => setSeverityFilter('error')}
                >
                  エラー ({report.errorCount})
                </Button>
                <Button
                  variant={severityFilter === 'warning' ? 'contained' : 'outlined'}
                  size="small"
                  color="warning"
                  onClick={() => setSeverityFilter('warning')}
                >
                  警告 ({report.warningCount})
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Results List */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                {filteredResults.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      問題は見つかりませんでした
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      フィルタリングされた結果に問題はありません
                    </Typography>
                  </Box>
                ) : (
                  filteredResults.map((result, index) => (
                    <Accordion key={result.key}>
                      <AccordionSummary 
                        expandIcon={<ExpandMore />}
                        sx={{
                          bgcolor: result.issues.length > 0 ? 
                            (result.issues.some(i => i.severity === 'error') ? 
                              alpha(theme.palette.error.main, 0.1) : 
                              alpha(theme.palette.warning.main, 0.1)) 
                            : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={result.score}
                              color={getScoreColor(result.score)}
                              size="small"
                            />
                            <Typography variant="subtitle2">
                              {result.key}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                            {result.issues.map((issue, i) => (
                              <Chip
                                key={i}
                                size="small"
                                icon={getSeverityIcon(issue.severity)}
                                label={issue.type.replace('_', ' ')}
                                color={issue.severity}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            原文:
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {result.originalText}
                            </Typography>
                          </Paper>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            翻訳:
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {result.translatedText}
                            </Typography>
                          </Paper>
                        </Box>

                        {result.issues.length > 0 && (
                          <>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              検出された問題:
                            </Typography>
                            <List dense>
                              {result.issues.map((issue, i) => (
                                <ListItem key={i}>
                                  <ListItemIcon>
                                    {getSeverityIcon(issue.severity)}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={issue.message}
                                    secondary={issue.suggestion}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default QualityCheckPanel