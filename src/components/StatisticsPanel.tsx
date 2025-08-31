import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  SxProps,
  Theme,
  Alert,
  AlertTitle
} from '@mui/material'
import {
  Assessment,
  Category,
  Language,
  Extension,
  Error,
  Warning
} from '@mui/icons-material'

interface StatisticsData {
  totalFiles: number
  totalEntries: number
  namespaces: string[]
  locales: string[]
  categories: { [key: string]: number }
}

interface StatisticsPanelProps {
  statistics: StatisticsData
  errors: string[]
  warnings: string[]
  sx?: SxProps<Theme>
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  statistics,
  errors,
  warnings,
  sx
}) => {
  const hasData = statistics.totalFiles > 0

  if (!hasData) {
    return (
      <Box sx={sx}>
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Assessment sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              統計情報なし
            </Typography>
            <Typography variant="body2" color="text.disabled">
              ファイルを追加すると統計情報が表示されます
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const topCategories = Object.entries(statistics.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <Box sx={sx}>
      <Grid container spacing={2}>
        {/* Overview Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" />
                概要
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {statistics.totalFiles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ファイル数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary" fontWeight="bold">
                      {statistics.totalEntries.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      エントリー数
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Namespaces */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Extension color="primary" />
                検出されたMod ({statistics.namespaces.length})
              </Typography>
              
              {statistics.namespaces.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {statistics.namespaces.map((namespace) => (
                    <Chip
                      key={namespace}
                      label={namespace}
                      variant="outlined"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  検出されたModはありません
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Locales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Language color="primary" />
                言語 ({statistics.locales.length})
              </Typography>
              
              {statistics.locales.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {statistics.locales.map((locale) => (
                    <Chip
                      key={locale}
                      label={locale}
                      variant="outlined"
                      color="secondary"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  検出された言語はありません
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category color="primary" />
                カテゴリー別エントリー数
              </Typography>
              
              {topCategories.length > 0 ? (
                <List dense>
                  {topCategories.map(([category, count], index) => (
                    <ListItem key={category} divider={index < topCategories.length - 1}>
                      <ListItemIcon>
                        <Chip 
                          label={category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${count.toLocaleString()} エントリー`}
                        secondary={`${((count / statistics.totalEntries) * 100).toFixed(1)}%`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  カテゴリー情報がありません
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Errors and Warnings */}
        {(errors.length > 0 || warnings.length > 0) && (
          <Grid item xs={12}>
            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Error />
                  エラー ({errors.length})
                </AlertTitle>
                <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index}>
                      <Typography variant="body2">{error}</Typography>
                    </li>
                  ))}
                  {errors.length > 5 && (
                    <li>
                      <Typography variant="body2" color="text.secondary">
                        ...他 {errors.length - 5} 件
                      </Typography>
                    </li>
                  )}
                </Box>
              </Alert>
            )}

            {warnings.length > 0 && (
              <Alert severity="warning">
                <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning />
                  警告 ({warnings.length})
                </AlertTitle>
                <Box component="ul" sx={{ margin: 0, paddingLeft: 2 }}>
                  {warnings.slice(0, 3).map((warning, index) => (
                    <li key={index}>
                      <Typography variant="body2">{warning}</Typography>
                    </li>
                  ))}
                  {warnings.length > 3 && (
                    <li>
                      <Typography variant="body2" color="text.secondary">
                        ...他 {warnings.length - 3} 件
                      </Typography>
                    </li>
                  )}
                </Box>
              </Alert>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default StatisticsPanel