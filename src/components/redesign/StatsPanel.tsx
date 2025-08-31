import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  TrendingUp,
  Assessment,
  AttachMoney,
  Translate,
  Schedule,
  Language,
  Download,
  Refresh,
  DeleteForever,
  Warning,
  CheckCircle,
  Speed,
  Psychology
} from '@mui/icons-material'
import { TranslationStatsManager, UsageStats, TranslationSession } from '../../utils/translationStats'

const StatsPanel: React.FC = () => {
  const theme = useTheme()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [sessions, setSessions] = useState<TranslationSession[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [period, setPeriod] = useState<number>(30)
  const [isLoading, setIsLoading] = useState(false)

  const loadStats = () => {
    setIsLoading(true)
    
    // Simulate loading time
    setTimeout(() => {
      const report = TranslationStatsManager.generateDetailedReport(period)
      setStats(report.stats)
      setSessions(report.sessions)
      setRecommendations(report.recommendations)
      setIsLoading(false)
    }, 500)
  }

  useEffect(() => {
    loadStats()
  }, [period])

  const exportStats = (format: 'json' | 'csv') => {
    const report = TranslationStatsManager.exportReport(format)
    const blob = new Blob([report], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `langpack-stats-${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAllStats = () => {
    if (window.confirm('すべての統計データを削除しますか？この操作は取り消せません。')) {
      TranslationStatsManager.clearStats()
      loadStats()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'google': return '🔵'
      case 'deepl': return '🟢'
      case 'azure': return '🔷'
      case 'openai': return '🤖'
      case 'gemini': return '✨'
      case 'libretranslate': return '🆓'
      default: return '❓'
    }
  }

  if (!stats) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <TrendingUp sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            統計データを読み込み中...
          </Typography>
          {isLoading && <LinearProgress sx={{ mt: 2 }} />}
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
            翻訳統計・レポート
          </Typography>
          <Typography variant="body2" color="text.secondary">
            過去{period}日間の使用状況
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>期間</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              label="期間"
            >
              <MenuItem value={7}>7日</MenuItem>
              <MenuItem value={30}>30日</MenuItem>
              <MenuItem value={90}>90日</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            startIcon={<Download />}
            onClick={() => exportStats('json')}
            size="small"
          >
            JSON
          </Button>
          <Button
            startIcon={<Download />}
            onClick={() => exportStats('csv')}
            size="small"
          >
            CSV
          </Button>
          <IconButton onClick={loadStats} disabled={isLoading}>
            <Refresh />
          </IconButton>
          <IconButton onClick={clearAllStats} color="error">
            <DeleteForever />
          </IconButton>
        </Box>
      </Box>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">
              {stats.totalSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              翻訳セッション
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Translate sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" color="secondary">
              {formatNumber(stats.totalTranslations)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              翻訳数
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" color="info">
              {formatNumber(stats.totalCharacters)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              翻訳文字数
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AttachMoney sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success">
              {formatCurrency(stats.totalCost)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              推定コスト
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              おすすめ・改善提案
            </Typography>
            {recommendations.map((rec, index) => (
              <Alert 
                key={index} 
                severity="info" 
                sx={{ mb: 1 }}
                icon={<Psychology />}
              >
                {rec}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Service Usage */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                翻訳サービス使用状況
              </Typography>
              <List>
                {Object.entries(stats.serviceUsage)
                  .sort(([,a], [,b]) => b - a)
                  .map(([service, count]) => {
                    const percentage = (count / stats.totalTranslations) * 100
                    return (
                      <ListItem key={service} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Typography variant="h5">{getServiceIcon(service)}</Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {service}
                              </Typography>
                              <Chip 
                                label={`${count} (${percentage.toFixed(1)}%)`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          }
                        />
                      </ListItem>
                    )
                  })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Language Pairs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                言語ペア使用頻度
              </Typography>
              <List>
                {Object.entries(stats.languagePairs)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([pair, count]) => {
                    const [from, to] = pair.split('-')
                    const percentage = (count / stats.totalTranslations) * 100
                    return (
                      <ListItem key={pair} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Language color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2">
                                {from.toUpperCase()} → {to.toUpperCase()}
                              </Typography>
                              <Chip 
                                label={`${count} (${percentage.toFixed(1)}%)`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    )
                  })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sessions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                最近の翻訳セッション
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>開始時刻</TableCell>
                      <TableCell>サービス</TableCell>
                      <TableCell>言語ペア</TableCell>
                      <TableCell align="right">エントリー数</TableCell>
                      <TableCell align="right">文字数</TableCell>
                      <TableCell align="right">コスト</TableCell>
                      <TableCell align="center">品質スコア</TableCell>
                      <TableCell align="center">ステータス</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(session.startTime).toLocaleDateString('ja-JP')}
                            <br />
                            <span style={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
                              {new Date(session.startTime).toLocaleTimeString('ja-JP')}
                            </span>
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{getServiceIcon(session.service)}</span>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {session.service}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.fromLanguage.toUpperCase()} → {session.toLanguage.toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {session.successfulEntries}
                            {session.failedEntries > 0 && (
                              <span style={{ color: theme.palette.error.main }}>
                                /{session.failedEntries}
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatNumber(session.totalCharacters)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(session.costs.estimatedCost)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {session.qualityScore !== undefined ? (
                            <Chip
                              label={`${session.qualityScore.toFixed(1)}%`}
                              size="small"
                              color={session.qualityScore >= 80 ? 'success' : 
                                     session.qualityScore >= 60 ? 'warning' : 'error'}
                            />
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {session.endTime ? (
                            <Tooltip title="完了">
                              <CheckCircle color="success" fontSize="small" />
                            </Tooltip>
                          ) : (
                            <Tooltip title="実行中">
                              <Speed color="primary" fontSize="small" />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {sessions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    翻訳セッションの履歴がありません
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quality Score Summary */}
      {stats.averageQualityScore > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              品質スコア概要
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color={stats.averageQualityScore >= 80 ? 'success.main' : 
                                                     stats.averageQualityScore >= 60 ? 'warning.main' : 'error.main'}>
                    {stats.averageQualityScore.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    平均品質スコア
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={stats.averageQualityScore}
                    sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    color={stats.averageQualityScore >= 80 ? 'success' : 
                           stats.averageQualityScore >= 60 ? 'warning' : 'error'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {stats.averageQualityScore >= 80 ? '優秀' : 
                     stats.averageQualityScore >= 60 ? '良好' : '要改善'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default StatsPanel