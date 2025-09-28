import React, { useCallback } from 'react'
import { selectFiles } from '../../../utils/webFileUtils'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import {
  CloudUpload,
  FolderOpen,
  InsertDriveFile,
  Delete,
  DataObject,
  CheckCircle,
  Error,
  Info,
  Assessment
} from '@mui/icons-material'

interface ImportViewProps {
  files: any[]
  onFilesSelected: (files: any[]) => void
  onRemoveFile: (index: number) => void
  statistics: any
  parseResults: any[]
}

const ImportView: React.FC<ImportViewProps> = ({
  files,
  onFilesSelected,
  onRemoveFile,
  statistics,
  parseResults
}) => {
  const theme = useTheme()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processFiles = async () => {
      const fileContents = await Promise.all(
        acceptedFiles.map(async (file) => {
          const content = await file.text()
          const fileType = file.name.endsWith('.json') ? 'json' : 'lang'
          
          return {
            path: file.name,
            name: file.name,
            content,
            type: fileType
          }
        })
      )
      onFilesSelected(fileContents)
    }
    
    processFiles()
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.lang']
    }
  })

  const handleSelectFiles = async () => {
    try {
      const selectedFiles = await selectFiles()
      if (selectedFiles && selectedFiles.length > 0) {
        onFilesSelected(selectedFiles)
      }
    } catch (error) {
      console.error('Error selecting files:', error)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          言語ファイルをインポート
        </Typography>
        <Typography variant="body1" color="text.secondary">
          JSON または LANG 形式のファイルをドラッグ&ドロップまたは選択してください
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Drop Zone */}
        <Grid item xs={12} md={6}>
          <Card
            {...getRootProps()}
            sx={{
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: isDragActive
                ? alpha(theme.palette.primary.main, 0.08)
                : theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'
                : 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)',
              border: `2px dashed ${
                isDragActive
                  ? theme.palette.primary.main
                  : alpha(theme.palette.divider, 0.3)
              }`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.04),
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <input {...getInputProps()} />
            <CardContent sx={{ textAlign: 'center' }}>
              <CloudUpload
                sx={{
                  fontSize: 80,
                  color: isDragActive ? 'primary.main' : 'text.disabled',
                  mb: 2,
                  transition: 'all 0.3s ease',
                }}
              />
              <Typography variant="h6" gutterBottom>
                {isDragActive
                  ? 'ファイルをドロップしてください'
                  : 'ファイルをドラッグ&ドロップ'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                または
              </Typography>
              <Button
                variant="contained"
                startIcon={<FolderOpen />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelectFiles()
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                ファイルを選択
              </Button>
              <Box sx={{ mt: 3 }}>
                <Chip label=".json" size="small" sx={{ mr: 1 }} />
                <Chip label=".lang" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* File List */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                インポートされたファイル ({files.length})
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {files.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InsertDriveFile sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    まだファイルがインポートされていません
                  </Typography>
                </Box>
              ) : (
                <List>
                  {files.map((file, index) => {
                    const isJson = file.type === 'json'
                    const parseResult = parseResults[index]
                    const hasError = parseResult && !parseResult.success

                    return (
                      <ListItem
                        key={index}
                        sx={{
                          mb: 1,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          '&:hover': {
                            bgcolor: 'action.selected',
                          },
                        }}
                      >
                        <ListItemIcon>
                          {isJson ? (
                            <DataObject color="primary" />
                          ) : (
                            <InsertDriveFile color="secondary" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">{file.name}</Typography>
                              {parseResult && (
                                <>
                                  {parseResult.success ? (
                                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                  ) : (
                                    <Error sx={{ fontSize: 16, color: 'error.main' }} />
                                  )}
                                </>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={isJson ? 'JSON' : 'LANG'}
                                size="small"
                                color={isJson ? 'primary' : 'secondary'}
                                variant="outlined"
                              />
                              {parseResult && parseResult.entryCount > 0 && (
                                <Chip
                                  label={`${parseResult.entryCount} エントリー`}
                                  size="small"
                                />
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => onRemoveFile(index)}
                            size="small"
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Statistics */}
        {statistics && statistics.totalEntries > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Assessment color="primary" />
                  <Typography variant="h6">統計情報</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {statistics.totalFiles}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ファイル数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary.main">
                        {statistics.totalEntries.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総エントリー数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {statistics.namespaces.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mod数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {statistics.locales.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        言語数
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default ImportView