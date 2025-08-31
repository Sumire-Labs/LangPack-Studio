import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  useTheme
} from '@mui/material'
import {
  Close,
  Settings,
  Language,
  Security,
  Palette,
  Speed,
  Storage,
  ExpandMore,
  Visibility,
  VisibilityOff,
  Delete,
  Save,
  RestoreFromTrash
} from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

interface SettingsState {
  // API Keys
  googleApiKey: string
  deeplApiKey: string
  azureApiKey: string
  azureRegion: string
  openaiApiKey: string
  geminiApiKey: string
  
  // Translation Settings
  defaultFromLanguage: string
  defaultToLanguage: string
  batchSize: number
  requestDelay: number
  maxRetries: number
  
  // App Settings
  theme: 'light' | 'dark' | 'system'
  language: 'ja' | 'en'
  autoSave: boolean
  autoSaveInterval: number
  
  // File Settings
  defaultOutputPath: string
  defaultPackName: string
  compressionLevel: number
  includeTimestamp: boolean
  
  // Performance
  maxConcurrentRequests: number
  cacheEnabled: boolean
  cacheMaxSize: number
}

const defaultSettings: SettingsState = {
  // API Keys
  googleApiKey: '',
  deeplApiKey: '',
  azureApiKey: '',
  azureRegion: 'eastus',
  openaiApiKey: '',
  geminiApiKey: '',
  
  // Translation Settings
  defaultFromLanguage: 'en',
  defaultToLanguage: 'ja',
  batchSize: 50,
  requestDelay: 1000,
  maxRetries: 3,
  
  // App Settings
  theme: 'system',
  language: 'ja',
  autoSave: true,
  autoSaveInterval: 30,
  
  // File Settings
  defaultOutputPath: '',
  defaultPackName: 'My Language Pack',
  compressionLevel: 6,
  includeTimestamp: false,
  
  // Performance
  maxConcurrentRequests: 3,
  cacheEnabled: true,
  cacheMaxSize: 1000
}

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  onSettingsChange: (settings: SettingsState) => void
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  onSettingsChange
}) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('langpack-studio-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [open])

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('langpack-studio-settings', JSON.stringify(settings))
    // Notify parent component
    onSettingsChange(settings)
    onClose()
  }

  const handleReset = () => {
    setSettings(defaultSettings)
  }

  const handleResetApiKeys = () => {
    setSettings(prev => ({
      ...prev,
      googleApiKey: '',
      deeplApiKey: '',
      azureApiKey: '',
      openaiApiKey: '',
      geminiApiKey: ''
    }))
  }

  const toggleApiKeyVisibility = (keyName: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }))
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings color="primary" />
          <Typography variant="h6">設定</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable">
            <Tab 
              icon={<Security />} 
              label="API設定" 
              iconPosition="start"
            />
            <Tab 
              icon={<Language />} 
              label="翻訳設定" 
              iconPosition="start"
            />
            <Tab 
              icon={<Palette />} 
              label="アプリ設定" 
              iconPosition="start"
            />
            <Tab 
              icon={<Storage />} 
              label="ファイル設定" 
              iconPosition="start"
            />
            <Tab 
              icon={<Speed />} 
              label="パフォーマンス" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3, height: 'calc(80vh - 180px)', overflow: 'auto' }}>
          {/* API Settings Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              翻訳APIキー管理
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              APIキーはローカルに暗号化して保存されます。外部に送信されることはありません。
            </Alert>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">登録済みAPIキー</Typography>
              <Button
                startIcon={<Delete />}
                onClick={handleResetApiKeys}
                color="error"
                size="small"
              >
                全て削除
              </Button>
            </Box>

            <List>
              {/* Google Translate API */}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Google Translate API Key"
                    type={showApiKeys['google'] ? 'text' : 'password'}
                    value={settings.googleApiKey}
                    onChange={(e) => handleSettingChange('googleApiKey', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => toggleApiKeyVisibility('google')}>
                          {showApiKeys['google'] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    helperText="Google Cloud Translation APIキー"
                    sx={{ mb: 2 }}
                  />
                </Box>
              </ListItem>

              {/* DeepL API */}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="DeepL API Key"
                    type={showApiKeys['deepl'] ? 'text' : 'password'}
                    value={settings.deeplApiKey}
                    onChange={(e) => handleSettingChange('deeplApiKey', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => toggleApiKeyVisibility('deepl')}>
                          {showApiKeys['deepl'] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    helperText="DeepL APIキー（Pro版）"
                    sx={{ mb: 2 }}
                  />
                </Box>
              </ListItem>

              {/* Azure Translator */}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Azure Translator API Key"
                    type={showApiKeys['azure'] ? 'text' : 'password'}
                    value={settings.azureApiKey}
                    onChange={(e) => handleSettingChange('azureApiKey', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => toggleApiKeyVisibility('azure')}>
                          {showApiKeys['azure'] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    helperText="Azure Cognitive Services APIキー"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    label="Azure Region"
                    value={settings.azureRegion}
                    onChange={(e) => handleSettingChange('azureRegion', e.target.value)}
                    helperText="例: eastus, westus2"
                    sx={{ mb: 2 }}
                  />
                </Box>
              </ListItem>

              {/* OpenAI API */}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="OpenAI API Key"
                    type={showApiKeys['openai'] ? 'text' : 'password'}
                    value={settings.openaiApiKey}
                    onChange={(e) => handleSettingChange('openaiApiKey', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => toggleApiKeyVisibility('openai')}>
                          {showApiKeys['openai'] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    helperText="OpenAI GPT APIキー"
                    sx={{ mb: 2 }}
                  />
                </Box>
              </ListItem>

              {/* Gemini API */}
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    label="Google Gemini API Key"
                    type={showApiKeys['gemini'] ? 'text' : 'password'}
                    value={settings.geminiApiKey}
                    onChange={(e) => handleSettingChange('geminiApiKey', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => toggleApiKeyVisibility('gemini')}>
                          {showApiKeys['gemini'] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      )
                    }}
                    helperText="Google AI Studio APIキー"
                    sx={{ mb: 2 }}
                  />
                </Box>
              </ListItem>
            </List>
          </TabPanel>

          {/* Translation Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              翻訳設定
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>デフォルト翻訳元言語</InputLabel>
                <Select
                  value={settings.defaultFromLanguage}
                  onChange={(e) => handleSettingChange('defaultFromLanguage', e.target.value)}
                  label="デフォルト翻訳元言語"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>デフォルト翻訳先言語</InputLabel>
                <Select
                  value={settings.defaultToLanguage}
                  onChange={(e) => handleSettingChange('defaultToLanguage', e.target.value)}
                  label="デフォルト翻訳先言語"
                >
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="zh">中文</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">高度な翻訳設定</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  label="バッチサイズ"
                  type="number"
                  value={settings.batchSize}
                  onChange={(e) => handleSettingChange('batchSize', Number(e.target.value))}
                  helperText="一度に処理する翻訳エントリー数"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="リクエスト間隔 (ms)"
                  type="number"
                  value={settings.requestDelay}
                  onChange={(e) => handleSettingChange('requestDelay', Number(e.target.value))}
                  helperText="APIリクエスト間の待機時間"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="最大リトライ回数"
                  type="number"
                  value={settings.maxRetries}
                  onChange={(e) => handleSettingChange('maxRetries', Number(e.target.value))}
                  helperText="翻訳失敗時の再試行回数"
                />
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          {/* App Settings Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              アプリケーション設定
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>テーマ</InputLabel>
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                label="テーマ"
              >
                <MenuItem value="light">ライトテーマ</MenuItem>
                <MenuItem value="dark">ダークテーマ</MenuItem>
                <MenuItem value="system">システム設定に従う</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>言語</InputLabel>
              <Select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                label="言語"
              >
                <MenuItem value="ja">日本語</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
              }
              label="自動保存"
              sx={{ mb: 2 }}
            />

            {settings.autoSave && (
              <TextField
                fullWidth
                label="自動保存間隔 (秒)"
                type="number"
                value={settings.autoSaveInterval}
                onChange={(e) => handleSettingChange('autoSaveInterval', Number(e.target.value))}
                helperText="作業内容の自動保存間隔"
                sx={{ mb: 2 }}
              />
            )}
          </TabPanel>

          {/* File Settings Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              ファイル設定
            </Typography>

            <TextField
              fullWidth
              label="デフォルト出力パス"
              value={settings.defaultOutputPath}
              onChange={(e) => handleSettingChange('defaultOutputPath', e.target.value)}
              helperText="リソースパックの保存先（空白の場合はダウンロードフォルダ）"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="デフォルトパック名"
              value={settings.defaultPackName}
              onChange={(e) => handleSettingChange('defaultPackName', e.target.value)}
              helperText="新規作成時のパック名"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="圧縮レベル"
              type="number"
              value={settings.compressionLevel}
              onChange={(e) => handleSettingChange('compressionLevel', Number(e.target.value))}
              helperText="ZIPファイルの圧縮レベル (0-9, 6が推奨)"
              inputProps={{ min: 0, max: 9 }}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.includeTimestamp}
                  onChange={(e) => handleSettingChange('includeTimestamp', e.target.checked)}
                />
              }
              label="ファイル名にタイムスタンプを含める"
            />
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              パフォーマンス設定
            </Typography>

            <TextField
              fullWidth
              label="最大同時リクエスト数"
              type="number"
              value={settings.maxConcurrentRequests}
              onChange={(e) => handleSettingChange('maxConcurrentRequests', Number(e.target.value))}
              helperText="同時に実行する翻訳リクエスト数"
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.cacheEnabled}
                  onChange={(e) => handleSettingChange('cacheEnabled', e.target.checked)}
                />
              }
              label="翻訳結果のキャッシュを有効にする"
              sx={{ mb: 2 }}
            />

            {settings.cacheEnabled && (
              <TextField
                fullWidth
                label="キャッシュ最大サイズ"
                type="number"
                value={settings.cacheMaxSize}
                onChange={(e) => handleSettingChange('cacheMaxSize', Number(e.target.value))}
                helperText="保存する翻訳結果の最大数"
                sx={{ mb: 2 }}
              />
            )}

            <Alert severity="info">
              パフォーマンス設定を変更すると、翻訳速度やメモリ使用量に影響する場合があります。
            </Alert>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} startIcon={<RestoreFromTrash />}>
          リセット
        </Button>
        <Button onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SettingsDialog