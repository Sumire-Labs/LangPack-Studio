import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Link,
  Tabs,
  Tab,
  Chip
} from '@mui/material'
import {
  Settings,
  Visibility,
  VisibilityOff,
  Check,
  Close,
  Info
} from '@mui/icons-material'
import { TranslationConfigManager, TranslationConfig } from '../utils/translationConfig'

interface TranslationSettingsProps {
  open: boolean
  onClose: () => void
  onSave: (config: TranslationConfig) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

const TranslationSettings: React.FC<TranslationSettingsProps> = ({
  open,
  onClose,
  onSave
}) => {
  const [tabValue, setTabValue] = useState(0)
  const [service, setService] = useState<string>('google')
  const [apiKey, setApiKey] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [region, setRegion] = useState('global')
  const [model, setModel] = useState('gpt-3.5-turbo')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const config = TranslationConfigManager.getConfig()
    if (config) {
      setService(config.service)
      setApiKey(config.apiKey || '')
      setApiUrl(config.apiUrl || '')
      setRegion(config.region || 'global')
      setModel(config.model || 'gpt-3.5-turbo')
    }
  }, [open])

  useEffect(() => {
    if (apiKey) {
      setIsValid(TranslationConfigManager.validateApiKey(service, apiKey))
    } else {
      setIsValid(service === 'libretranslate') // LibreTranslate doesn't require API key
    }
  }, [service, apiKey])

  const handleSave = () => {
    const config: TranslationConfig = {
      service: service as any,
      apiKey: apiKey || undefined,
      apiUrl: apiUrl || undefined,
      region: region || undefined,
      model: model || undefined
    }
    
    TranslationConfigManager.saveConfig(config)
    onSave(config)
    onClose()
  }

  const getServiceInfo = () => {
    switch (service) {
      case 'google':
        return {
          name: 'Google Cloud Translation',
          description: '高品質な翻訳、100+ 言語対応',
          pricing: '月20ドル/100万文字',
          link: 'https://cloud.google.com/translate',
          keyFormat: 'AIza... (39文字)'
        }
      case 'deepl':
        return {
          name: 'DeepL API',
          description: '最高品質の翻訳、自然な表現',
          pricing: '無料プラン: 月50万文字まで',
          link: 'https://www.deepl.com/pro-api',
          keyFormat: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx'
        }
      case 'azure':
        return {
          name: 'Azure Translator',
          description: 'Microsoft の翻訳サービス',
          pricing: '無料: 月200万文字まで',
          link: 'https://azure.microsoft.com/services/cognitive-services/translator/',
          keyFormat: '32文字の16進数文字列'
        }
      case 'openai':
        return {
          name: 'OpenAI GPT',
          description: 'AIによる文脈を理解した翻訳',
          pricing: 'GPT-3.5: $0.002/1K tokens',
          link: 'https://platform.openai.com/',
          keyFormat: 'sk-... (48文字以上)'
        }
      case 'libretranslate':
        return {
          name: 'LibreTranslate',
          description: 'オープンソース翻訳サービス',
          pricing: '無料（レート制限あり）',
          link: 'https://libretranslate.com/',
          keyFormat: 'APIキー不要'
        }
      default:
        return null
    }
  }

  const serviceInfo = getServiceInfo()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        翻訳サービス設定
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label="基本設定" />
          <Tab label="無料オプション" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>翻訳サービス</InputLabel>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value)}
              label="翻訳サービス"
            >
              <MenuItem value="google">Google Cloud Translation (高品質)</MenuItem>
              <MenuItem value="deepl">DeepL (最高品質)</MenuItem>
              <MenuItem value="azure">Azure Translator</MenuItem>
              <MenuItem value="openai">OpenAI GPT (AI翻訳)</MenuItem>
              <MenuItem value="libretranslate">LibreTranslate (無料)</MenuItem>
            </Select>
          </FormControl>

          {serviceInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {serviceInfo.name}
              </Typography>
              <Typography variant="body2">
                {serviceInfo.description}
              </Typography>
              <Typography variant="caption" display="block">
                料金: {serviceInfo.pricing}
              </Typography>
              <Link href={serviceInfo.link} target="_blank" rel="noopener">
                APIキーを取得 →
              </Link>
            </Alert>
          )}

          {service !== 'libretranslate' && (
            <TextField
              fullWidth
              label="APIキー"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type={showApiKey ? 'text' : 'password'}
              sx={{ mb: 2 }}
              helperText={serviceInfo?.keyFormat}
              error={apiKey !== '' && !isValid}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    {isValid && <Check color="success" />}
                  </InputAdornment>
                )
              }}
            />
          )}

          {service === 'azure' && (
            <TextField
              fullWidth
              label="リージョン"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              sx={{ mb: 2 }}
              helperText="例: japaneast, global"
            />
          )}

          {service === 'openai' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>モデル</InputLabel>
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                label="モデル"
              >
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo (高速・安価)</MenuItem>
                <MenuItem value="gpt-4">GPT-4 (高品質)</MenuItem>
                <MenuItem value="gpt-4-turbo">GPT-4 Turbo (最新)</MenuItem>
              </Select>
            </FormControl>
          )}

          {service === 'libretranslate' && (
            <TextField
              fullWidth
              label="カスタムサーバーURL (オプション)"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="https://libretranslate.de"
              helperText="独自のLibreTranslateサーバーを使用する場合"
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              無料オプションについて
            </Typography>
            <Typography variant="body2">
              APIキーなしで使える翻訳サービスは制限があります：
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>使用回数制限（1日数百回程度）</li>
              <li>翻訳速度が遅い（レート制限）</li>
              <li>翻訳品質が劣る場合がある</li>
              <li>サービスが不安定な場合がある</li>
            </ul>
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant={service === 'libretranslate' ? 'contained' : 'outlined'}
              onClick={() => setService('libretranslate')}
              sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <Box>
                <Typography variant="subtitle2">
                  LibreTranslate (完全無料)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  オープンソース、プライバシー重視
                </Typography>
              </Box>
            </Button>

            <Alert severity="info">
              <Typography variant="body2">
                本格的に使用する場合は、APIキーを取得することをお勧めします。
                DeepLは無料プランで月50万文字まで翻訳可能です。
              </Typography>
            </Alert>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TranslationSettings