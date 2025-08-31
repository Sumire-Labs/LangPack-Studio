import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
  useTheme
} from '@mui/material'
import {
  Preview,
  Search,
  ExpandMore,
  CheckCircle,
  Language,
  Extension,
  Category
} from '@mui/icons-material'

interface PreviewViewProps {
  files: any[]
  translatedEntries: any[]
  parseResults: any[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const PreviewView: React.FC<PreviewViewProps> = ({
  files,
  translatedEntries,
  parseResults
}) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const allEntries = parseResults.flatMap(result => result.entries || [])
  
  const filteredEntries = allEntries.filter(entry =>
    !searchTerm ||
    entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedByNamespace = allEntries.reduce((groups, entry) => {
    const namespace = entry.namespace || 'unknown'
    if (!groups[namespace]) groups[namespace] = []
    groups[namespace].push(entry)
    return groups
  }, {} as { [key: string]: any[] })

  const groupedByCategory = allEntries.reduce((groups, entry) => {
    const category = entry.category || 'uncategorized'
    if (!groups[category]) groups[category] = []
    groups[category].push(entry)
    return groups
  }, {} as { [key: string]: any[] })

  const translationsByLocale = translatedEntries.reduce((groups, entry) => {
    if (!groups[entry.locale]) groups[entry.locale] = []
    groups[entry.locale].push(entry)
    return groups
  }, {} as { [key: string]: any[] })

  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Preview sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          プレビューするデータがありません
        </Typography>
        <Typography variant="body1" color="text.disabled">
          まず言語ファイルをインポートしてください
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          プレビュー & 確認
        </Typography>
        <Typography variant="body1" color="text.secondary">
          インポートされたファイルと翻訳結果を確認します
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {files.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                インポートファイル
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {allEntries.length.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                エントリー数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {translatedEntries.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                翻訳済み
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Object.keys(groupedByNamespace).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mod数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Completion Status */}
      {translatedEntries.length > 0 && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<CheckCircle />}
        >
          翻訳が完了しました！リソースパックを生成してダウンロードできます。
        </Alert>
      )}

      {/* Content Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="全エントリー" />
              <Tab label="Mod別" />
              <Tab label="カテゴリー別" />
              {translatedEntries.length > 0 && <Tab label="翻訳結果" />}
            </Tabs>
          </Box>

          {/* Search */}
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="エントリーを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Box>

          {/* Tab Content */}
          <Box sx={{ height: 400, overflow: 'auto' }}>
            {/* All Entries */}
            <TabPanel value={tabValue} index={0}>
              <List>
                {filteredEntries.slice(0, 100).map((entry, index) => (
                  <ListItem key={`${entry.key}-${index}`} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {entry.key}
                          </Typography>
                          {entry.namespace && (
                            <Chip
                              label={entry.namespace}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {entry.category && (
                            <Chip
                              label={entry.category}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: 'action.hover',
                            p: 1,
                            borderRadius: 1,
                            mt: 1,
                            fontFamily: 'monospace'
                          }}
                        >
                          {entry.value}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {filteredEntries.length > 100 && (
                  <ListItem>
                    <ListItemText
                      primary={`...他 ${filteredEntries.length - 100} 個のエントリー`}
                      sx={{ textAlign: 'center', opacity: 0.7 }}
                    />
                  </ListItem>
                )}
              </List>
            </TabPanel>

            {/* By Namespace */}
            <TabPanel value={tabValue} index={1}>
              {Object.entries(groupedByNamespace).map(([namespace, entries]) => (
                <Accordion key={namespace}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Extension color="primary" />
                      <Typography variant="subtitle1">{namespace}</Typography>
                      <Chip label={`${entries.length} エントリー`} size="small" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {entries.slice(0, 20).map((entry, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={entry.key}
                            secondary={entry.value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>

            {/* By Category */}
            <TabPanel value={tabValue} index={2}>
              {Object.entries(groupedByCategory).map(([category, entries]) => (
                <Accordion key={category}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category color="secondary" />
                      <Typography variant="subtitle1">{category}</Typography>
                      <Chip label={`${entries.length} エントリー`} size="small" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {entries.slice(0, 20).map((entry, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={entry.key}
                            secondary={entry.value}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </TabPanel>

            {/* Translations */}
            {translatedEntries.length > 0 && (
              <TabPanel value={tabValue} index={3}>
                {Object.entries(translationsByLocale).map(([locale, entries]) => (
                  <Accordion key={locale} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language color="success" />
                        <Typography variant="subtitle1">{locale}</Typography>
                        <Chip 
                          label={`${entries.length} 翻訳`} 
                          size="small" 
                          color="success"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {entries.slice(0, 50).map((entry, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={entry.key}
                              secondary={
                                <Box sx={{ mt: 1 }}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      bgcolor: 'success.light',
                                      color: 'success.contrastText',
                                      p: 1,
                                      borderRadius: 1,
                                      fontFamily: 'monospace'
                                    }}
                                  >
                                    {entry.value}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </TabPanel>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PreviewView