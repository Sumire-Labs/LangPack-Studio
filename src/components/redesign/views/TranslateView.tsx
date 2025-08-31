import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert
} from '@mui/material'
import { Translate as TranslateIcon, Language } from '@mui/icons-material'
import TranslationPanel from '../../TranslationPanel'

interface TranslateViewProps {
  files: any[]
  parseResults: any[]
  translatedEntries: any[]
  onTranslationComplete: (translations: any[]) => void
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void
}

const TranslateView: React.FC<TranslateViewProps> = ({
  files,
  parseResults,
  translatedEntries,
  onTranslationComplete,
  onNotification
}) => {
  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Language sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          翻訳するファイルがありません
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
          自動翻訳
        </Typography>
        <Typography variant="body1" color="text.secondary">
          インポートされたファイルを他の言語に翻訳します
        </Typography>
      </Box>

      {/* Translation Status */}
      {translatedEntries.length > 0 && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          icon={<TranslateIcon />}
        >
          {translatedEntries.length}個のエントリーが翻訳済みです。
          追加の翻訳を実行するか、次のステップに進んでください。
        </Alert>
      )}

      {/* Translation Panel */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TranslationPanel
            parseResults={parseResults}
            files={files}
            onTranslationComplete={onTranslationComplete}
            onNotification={onNotification}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default TranslateView