import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Typography, SxProps, Theme } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'

interface DropZoneProps {
  onFilesSelected: (files: any[]) => void
  sx?: SxProps<Theme>
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, sx }) => {
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

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: 2,
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderStyle: 'dashed',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover'
        },
        ...sx
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.primary" gutterBottom>
        {isDragActive ? 'ファイルをドロップしてください' : 'ファイルをドラッグ&ドロップ'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        JSON または LANG ファイルをサポート
      </Typography>
    </Box>
  )
}

export default DropZone