import React, { useState, useEffect } from 'react'
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Badge,
  Zoom,
  Fade,
  useMediaQuery,
  alpha
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  Language,
  GitHub
} from '@mui/icons-material'

// Import components
import Sidebar from './components/redesign/Sidebar'
import Header from './components/redesign/Header'
import MainContent from './components/redesign/MainContent'
import WelcomeScreen from './components/redesign/WelcomeScreen'
import FloatingActionBar from './components/redesign/FloatingActionBar'
import SettingsDialog from './components/redesign/SettingsDialog'
import { NotificationSnackbar } from './components/MaterialComponents'

// Import hooks
import { useLanguageParser } from './hooks/useLanguageParser'
import { useTranslation } from './hooks/useTranslation'
import { useResourcePackGenerator } from './hooks/useResourcePackGenerator'

// Types
export interface LanguageFile {
  path: string
  name: string
  content: string
  type: 'json' | 'lang'
}

export interface AppNotification {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

function AppNew() {
  // State management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('langpack_darkMode')
    return saved ? JSON.parse(saved) : false
  })
  
  const [activeView, setActiveView] = useState<'import' | 'translate' | 'generate' | 'preview'>('import')
  const [files, setFiles] = useState<LanguageFile[]>([])
  const [translatedEntries, setTranslatedEntries] = useState<{ key: string; value: string; locale: string }[]>([])
  const [notification, setNotification] = useState<AppNotification>({
    open: false,
    message: '',
    severity: 'info'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasVisited = localStorage.getItem('langpack_hasVisited')
    return !hasVisited
  })
  const [showSettings, setShowSettings] = useState(false)

  // Hooks
  const {
    parseResults,
    statistics,
    isLoading: isParsingFiles,
    errors: parseErrors,
    warnings: parseWarnings,
    parseFiles,
    validateAllFiles
  } = useLanguageParser()

  const {
    isGenerating,
    lastResult,
    generateAndSave,
    getGenerationSummary
  } = useResourcePackGenerator()

  // Media queries
  const isMobile = useMediaQuery('(max-width:600px)')
  const isTablet = useMediaQuery('(max-width:960px)')

  // Theme configuration
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#9c88ff' : '#6750a4',
            light: darkMode ? '#c7b7ff' : '#9a82db',
            dark: darkMode ? '#6c5ce7' : '#4f378b',
          },
          secondary: {
            main: darkMode ? '#feca57' : '#625b71',
          },
          background: {
            default: darkMode ? '#0f0f1e' : '#fafbff',
            paper: darkMode ? '#1a1a2e' : '#ffffff',
          },
          success: {
            main: '#4caf50',
          },
          warning: {
            main: '#ff9800',
          },
          error: {
            main: '#f44336',
          },
        },
        typography: {
          fontFamily: '"Inter", "Noto Sans JP", "Roboto", "Helvetica", "Arial", sans-serif',
          h4: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: '10px 20px',
                fontSize: '0.925rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                },
              },
              contained: {
                background: darkMode 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #6750a4 0%, #8b68d1 100%)',
                '&:hover': {
                  background: darkMode
                    ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                    : 'linear-gradient(135deg, #8b68d1 0%, #6750a4 100%)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: darkMode 
                  ? '0 8px 32px rgba(0,0,0,0.3)'
                  : '0 8px 32px rgba(0,0,0,0.08)',
                border: darkMode ? '1px solid rgba(255,255,255,0.05)' : 'none',
                backdropFilter: 'blur(10px)',
                background: darkMode
                  ? alpha('#1a1a2e', 0.8)
                  : alpha('#ffffff', 0.9),
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: darkMode
                  ? '0 4px 20px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.06)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 500,
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                borderRadius: 4,
                height: 6,
              },
            },
          },
        },
      }),
    [darkMode]
  )

  // Effects
  useEffect(() => {
    localStorage.setItem('langpack_darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (!showWelcome) {
      localStorage.setItem('langpack_hasVisited', 'true')
    }
  }, [showWelcome])

  useEffect(() => {
    if (files.length > 0) {
      parseFiles(files).then(results => {
        const successCount = results.filter(r => r.success).length
        const errorCount = results.filter(r => !r.success).length
        
        if (errorCount > 0) {
          showNotification(`${successCount}個のファイルを解析（${errorCount}個のエラー）`, 'warning')
        }
      })
    }
  }, [files])

  // Handlers
  const showNotification = (message: string, severity: AppNotification['severity'] = 'info') => {
    setNotification({ open: true, message, severity })
  }

  const handleFilesSelected = (newFiles: LanguageFile[]) => {
    setFiles(prev => [...prev, ...newFiles])
    showNotification(`${newFiles.length}個のファイルを追加しました`, 'success')
    
    // Auto-switch to translate view if files are loaded
    if (activeView === 'import' && newFiles.length > 0) {
      setTimeout(() => setActiveView('translate'), 500)
    }
  }

  const handleRemoveFile = (index: number) => {
    const fileName = files[index].name
    setFiles(prev => prev.filter((_, i) => i !== index))
    showNotification(`${fileName} を削除しました`, 'info')
  }

  const handleTranslationComplete = (newTranslations: { key: string; value: string; locale: string }[]) => {
    setTranslatedEntries(prev => {
      const merged = [...prev]
      newTranslations.forEach(newTrans => {
        const existingIndex = merged.findIndex(t => t.key === newTrans.key && t.locale === newTrans.locale)
        if (existingIndex >= 0) {
          merged[existingIndex] = newTrans
        } else {
          merged.push(newTrans)
        }
      })
      return merged
    })
    showNotification(`${newTranslations.length}個の翻訳を適用しました`, 'success')
  }

  const handleGenerateResourcePack = async (options: any) => {
    const allFiles = [...files]
    
    // Add translated entries as virtual files if they exist
    if (translatedEntries.length > 0) {
      const translationsByLocale = new Map<string, any>()
      
      translatedEntries.forEach(entry => {
        if (!translationsByLocale.has(entry.locale)) {
          translationsByLocale.set(entry.locale, {})
        }
        translationsByLocale.get(entry.locale)[entry.key] = entry.value
      })
      
      translationsByLocale.forEach((translations, locale) => {
        allFiles.push({
          path: `${locale}.json`,
          name: `${locale}.json`,
          content: JSON.stringify(translations, null, 2),
          type: 'json'
        })
      })
    }
    
    // packNameを使用してファイル名を生成
    const fileName = options.packName || 'resource-pack'
    const { success, result, saved } = await generateAndSave(allFiles, options, fileName)
    
    if (success && saved) {
      showNotification('リソースパックを生成・保存しました', 'success')
      setActiveView('preview')
    } else {
      showNotification('リソースパック生成に失敗しました', 'error')
    }
  }

  const handleReset = () => {
    setFiles([])
    setTranslatedEntries([])
    setActiveView('import')
    showNotification('すべてのデータをリセットしました', 'info')
  }

  const handleSettingsChange = (settings: any) => {
    // Apply theme changes
    if (settings.theme !== 'system') {
      setDarkMode(settings.theme === 'dark')
      localStorage.setItem('langpack_theme', settings.theme)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
      localStorage.removeItem('langpack_theme')
    }
    
    showNotification('設定を保存しました', 'success')
  }

  // Render
  if (showWelcome) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          fileCount={files.length}
          translationCount={translatedEntries.length}
          isMobile={isMobile}
          onSettingsClick={() => setShowSettings(true)}
        />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Header
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onReset={handleReset}
          />

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
            <Fade in timeout={300}>
              <Box>
                <MainContent
                  activeView={activeView}
                  files={files}
                  translatedEntries={translatedEntries}
                  parseResults={parseResults}
                  statistics={statistics}
                  onFilesSelected={handleFilesSelected}
                  onRemoveFile={handleRemoveFile}
                  onTranslationComplete={handleTranslationComplete}
                  onGenerateResourcePack={handleGenerateResourcePack}
                  onNotification={showNotification}
                />
              </Box>
            </Fade>
          </Box>

          {/* Floating Action Bar */}
          <FloatingActionBar
            activeView={activeView}
            hasFiles={files.length > 0}
            hasTranslations={translatedEntries.length > 0}
            onNext={() => {
              const views: typeof activeView[] = ['import', 'translate', 'generate', 'preview']
              const currentIndex = views.indexOf(activeView)
              if (currentIndex < views.length - 1) {
                setActiveView(views[currentIndex + 1])
              }
            }}
            onPrevious={() => {
              const views: typeof activeView[] = ['import', 'translate', 'generate', 'preview']
              const currentIndex = views.indexOf(activeView)
              if (currentIndex > 0) {
                setActiveView(views[currentIndex - 1])
              }
            }}
          />
        </Box>

        {/* Notification */}
        <NotificationSnackbar
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        />

        {/* Settings Dialog */}
        <SettingsDialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={handleSettingsChange}
        />
      </Box>
    </ThemeProvider>
  )
}

export default AppNew