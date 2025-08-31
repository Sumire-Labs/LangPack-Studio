import React from 'react'
import {
  Box,
  Container,
  Fade,
  Slide,
  Zoom,
  Paper
} from '@mui/material'

// Import view components
import ImportView from './views/ImportView'
import TranslateView from './views/TranslateView'
import GenerateView from './views/GenerateView'
import PreviewView from './views/PreviewView'

interface MainContentProps {
  activeView: 'import' | 'translate' | 'generate' | 'preview'
  files: any[]
  translatedEntries: any[]
  parseResults: any[]
  statistics: any
  onFilesSelected: (files: any[]) => void
  onRemoveFile: (index: number) => void
  onTranslationComplete: (translations: any[]) => void
  onGenerateResourcePack: (options: any) => void
  onNotification: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void
}

const MainContent: React.FC<MainContentProps> = ({
  activeView,
  files,
  translatedEntries,
  parseResults,
  statistics,
  onFilesSelected,
  onRemoveFile,
  onTranslationComplete,
  onGenerateResourcePack,
  onNotification
}) => {
  const renderContent = () => {
    switch (activeView) {
      case 'import':
        return (
          <ImportView
            files={files}
            onFilesSelected={onFilesSelected}
            onRemoveFile={onRemoveFile}
            statistics={statistics}
            parseResults={parseResults}
          />
        )
      case 'translate':
        return (
          <TranslateView
            files={files}
            parseResults={parseResults}
            translatedEntries={translatedEntries}
            onTranslationComplete={onTranslationComplete}
            onNotification={onNotification}
          />
        )
      case 'generate':
        return (
          <GenerateView
            files={files}
            translatedEntries={translatedEntries}
            onGenerateResourcePack={onGenerateResourcePack}
            onNotification={onNotification}
          />
        )
      case 'preview':
        return (
          <PreviewView
            files={files}
            translatedEntries={translatedEntries}
            parseResults={parseResults}
          />
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        key={activeView}
        sx={{
          animation: 'slideIn 0.3s ease-out',
          '@keyframes slideIn': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  )
}

export default MainContent