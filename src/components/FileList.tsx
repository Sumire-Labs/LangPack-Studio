import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Typography,
  SxProps,
  Theme
} from '@mui/material'
import {
  InsertDriveFile,
  DataObject,
  Delete,
  Language
} from '@mui/icons-material'

interface LanguageFile {
  path: string
  name: string
  content: string
  type?: 'json' | 'lang'
}

interface FileListProps {
  files: LanguageFile[]
  onRemove: (index: number) => void
  sx?: SxProps<Theme>
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, sx }) => {
  if (files.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 4,
          color: 'text.secondary',
          ...sx
        }}
      >
        <Language sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="body2">
          まだファイルが追加されていません
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx}>
      <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
        {files.map((file, index) => {
          const isJson = file.type === 'json' || file.name.endsWith('.json')
          let entryCount = 0
          
          try {
            if (isJson) {
              const parsed = JSON.parse(file.content)
              entryCount = Object.keys(parsed).length
            } else {
              entryCount = file.content.split('\n').filter(line => 
                line.trim() && !line.trim().startsWith('#')
              ).length
            }
          } catch (error) {
            entryCount = 0
          }

          return (
            <ListItem 
              key={index}
              divider={index < files.length - 1}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                {isJson ? (
                  <DataObject color="primary" />
                ) : (
                  <InsertDriveFile color="secondary" />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={file.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={isJson ? 'JSON' : 'LANG'}
                      size="small"
                      color={isJson ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {entryCount} エントリー
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => onRemove(index)}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

export default FileList