import React from 'react'
import {
  Box,
  Fab,
  Tooltip,
  Zoom,
  useTheme,
  alpha
} from '@mui/material'
import {
  NavigateBefore,
  NavigateNext,
  CheckCircle,
  Warning
} from '@mui/icons-material'

interface FloatingActionBarProps {
  activeView: 'import' | 'translate' | 'generate' | 'preview'
  hasFiles: boolean
  hasTranslations: boolean
  onNext: () => void
  onPrevious: () => void
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  activeView,
  hasFiles,
  hasTranslations,
  onNext,
  onPrevious
}) => {
  const theme = useTheme()

  const canGoNext = () => {
    switch (activeView) {
      case 'import':
        return hasFiles
      case 'translate':
        return hasFiles
      case 'generate':
        return hasFiles
      case 'preview':
        return false
      default:
        return false
    }
  }

  const canGoPrevious = () => {
    return activeView !== 'import'
  }

  const getNextLabel = () => {
    switch (activeView) {
      case 'import':
        return '翻訳へ進む'
      case 'translate':
        return 'パック生成へ進む'
      case 'generate':
        return 'プレビューへ進む'
      default:
        return '次へ'
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        gap: 2,
        zIndex: 1000,
      }}
    >
      {/* Previous Button */}
      <Zoom in={canGoPrevious()}>
        <Tooltip title="前へ戻る" placement="top">
          <Fab
            color="default"
            onClick={onPrevious}
            size="medium"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <NavigateBefore />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Next Button */}
      <Zoom in={canGoNext()}>
        <Tooltip title={getNextLabel()} placement="top">
          <Fab
            color="primary"
            onClick={onNext}
            variant="extended"
            sx={{
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 20px rgba(103, 80, 164, 0.3)',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 30px rgba(103, 80, 164, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {getNextLabel()}
            <NavigateNext sx={{ ml: 1 }} />
          </Fab>
        </Tooltip>
      </Zoom>

      {/* Status Indicator */}
      {activeView === 'generate' && hasFiles && (
        <Zoom in>
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 2,
              bgcolor: hasTranslations 
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${
                hasTranslations
                  ? alpha(theme.palette.success.main, 0.3)
                  : alpha(theme.palette.warning.main, 0.3)
              }`,
            }}
          >
            {hasTranslations ? (
              <>
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                <Box sx={{ fontSize: '0.75rem', color: 'success.main' }}>
                  翻訳済み
                </Box>
              </>
            ) : (
              <>
                <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
                <Box sx={{ fontSize: '0.75rem', color: 'warning.main' }}>
                  未翻訳
                </Box>
              </>
            )}
          </Box>
        </Zoom>
      )}
    </Box>
  )
}

export default FloatingActionBar