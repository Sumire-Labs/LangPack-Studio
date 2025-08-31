import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert
} from '@mui/material'
import {
  Search,
  ExpandMore,
  Category,
  Extension,
  Language,
  Close,
  ContentCopy
} from '@mui/icons-material'
import { ParseResult } from '../utils/languageParser'

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  parseResults: ParseResult[]
  files: { name: string; type?: string }[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`preview-tabpanel-${index}`}
      aria-labelledby={`preview-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  parseResults,
  files
}) => {
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const allEntries = useMemo(() => {
    return parseResults.flatMap(result => result.entries)
  }, [parseResults])

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.value.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesNamespace = !selectedNamespace || entry.namespace === selectedNamespace
      const matchesCategory = !selectedCategory || entry.category === selectedCategory
      
      return matchesSearch && matchesNamespace && matchesCategory
    })
  }, [allEntries, searchTerm, selectedNamespace, selectedCategory])

  const groupedByNamespace = useMemo(() => {
    const groups = new Map<string, typeof allEntries>()
    allEntries.forEach(entry => {
      const namespace = entry.namespace || 'unknown'
      if (!groups.has(namespace)) {
        groups.set(namespace, [])
      }
      groups.get(namespace)!.push(entry)
    })
    return groups
  }, [allEntries])

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, typeof allEntries>()
    allEntries.forEach(entry => {
      const category = entry.category || 'uncategorized'
      if (!groups.has(category)) {
        groups.set(category, [])
      }
      groups.get(category)!.push(entry)
    })
    return groups
  }, [allEntries])

  const statistics = useMemo(() => {
    const namespaces = [...new Set(allEntries.map(e => e.namespace).filter(Boolean))]
    const categories = [...new Set(allEntries.map(e => e.category).filter(Boolean))]
    
    return {
      totalEntries: allEntries.length,
      namespaces: namespaces.length,
      categories: categories.length,
      averageValueLength: allEntries.reduce((sum, entry) => sum + entry.value.length, 0) / allEntries.length
    }
  }, [allEntries])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    })
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (parseResults.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>プレビュー</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            プレビューするファイルがありません。まず言語ファイルをインポートしてください。
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">言語ファイルプレビュー</Typography>
        <Button onClick={onClose} color="inherit" size="small">
          <Close />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Statistics Bar */}
        <Paper sx={{ p: 2, m: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip 
              label={`${statistics.totalEntries} エントリー`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`${statistics.namespaces} Mod`} 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              label={`${statistics.categories} カテゴリー`} 
              color="info" 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              平均文字数: {Math.round(statistics.averageValueLength)}
            </Typography>
          </Box>
        </Paper>

        {/* Search and Filters */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="キーまたは翻訳文で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant={selectedNamespace ? "contained" : "outlined"}
              onClick={() => setSelectedNamespace(null)}
            >
              全てのMod
            </Button>
            {[...groupedByNamespace.keys()].map(namespace => (
              <Button
                key={namespace}
                size="small"
                variant={selectedNamespace === namespace ? "contained" : "outlined"}
                onClick={() => setSelectedNamespace(namespace === selectedNamespace ? null : namespace)}
              >
                {namespace} ({groupedByNamespace.get(namespace)?.length})
              </Button>
            ))}
          </Box>
        </Box>

        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="全エントリー" />
          <Tab label="Mod別" />
          <Tab label="カテゴリー別" />
        </Tabs>

        {/* All Entries Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 2, height: 400, overflow: 'auto' }}>
            <List dense>
              {filteredEntries.map((entry, index) => (
                <ListItem key={`${entry.key}-${index}`} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" component="span">
                          {entry.key}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(entry.key)}
                          startIcon={<ContentCopy />}
                          sx={{ minWidth: 'auto', p: 0.5 }}
                        />
                        {entry.namespace && (
                          <Chip label={entry.namespace} size="small" color="primary" variant="outlined" />
                        )}
                        {entry.category && (
                          <Chip label={entry.category} size="small" color="secondary" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-word',
                          bgcolor: 'action.hover',
                          p: 1,
                          borderRadius: 1,
                          mt: 1
                        }}
                      >
                        {entry.value}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              
              {filteredEntries.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="検索条件に一致するエントリーがありません"
                    secondary="検索条件を変更するか、フィルターをクリアしてください"
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </TabPanel>

        {/* Namespace Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 2, height: 400, overflow: 'auto' }}>
            {[...groupedByNamespace.entries()].map(([namespace, entries]) => (
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
                    {entries.slice(0, 10).map((entry, index) => (
                      <ListItem key={`${entry.key}-${index}`}>
                        <ListItemText
                          primary={entry.key}
                          secondary={entry.value}
                        />
                      </ListItem>
                    ))}
                    {entries.length > 10 && (
                      <ListItem>
                        <ListItemText
                          secondary={`...他 ${entries.length - 10} 個のエントリー`}
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>

        {/* Category Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 2, height: 400, overflow: 'auto' }}>
            {[...groupedByCategory.entries()].map(([category, entries]) => (
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
                    {entries.slice(0, 10).map((entry, index) => (
                      <ListItem key={`${entry.key}-${index}`}>
                        <ListItemText
                          primary={entry.key}
                          secondary={entry.value}
                        />
                      </ListItem>
                    ))}
                    {entries.length > 10 && (
                      <ListItem>
                        <ListItemText
                          secondary={`...他 ${entries.length - 10} 個のエントリー`}
                        />
                      </ListItem>
                    )}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PreviewModal