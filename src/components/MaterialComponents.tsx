import React from 'react'
import { 
  Fab, 
  Snackbar, 
  Alert, 
  AlertProps, 
  Backdrop,
  CircularProgress,
  Box,
  Typography,
  SxProps,
  Theme 
} from '@mui/material'
import { Add, Upload } from '@mui/icons-material'

// Floating Action Button for file upload
export interface UploadFabProps {
  onUpload: () => void
  disabled?: boolean
  sx?: SxProps<Theme>
}

export const UploadFab: React.FC<UploadFabProps> = ({ onUpload, disabled = false, sx }) => (
  <Fab
    color="primary"
    onClick={onUpload}
    disabled={disabled}
    sx={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      ...sx
    }}
  >
    <Upload />
  </Fab>
)

// Material Design 3 styled snackbar
export interface NotificationSnackbarProps {
  open: boolean
  message: string
  severity?: AlertProps['severity']
  onClose: () => void
  autoHideDuration?: number
}

export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity = 'info',
  onClose,
  autoHideDuration = 4000
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
  >
    <Alert 
      onClose={onClose} 
      severity={severity}
      variant="filled"
      sx={{ 
        borderRadius: 12,
        '& .MuiAlert-icon': {
          fontSize: 20
        }
      }}
    >
      {message}
    </Alert>
  </Snackbar>
)

// Loading backdrop with Material Design 3 styling
export interface LoadingBackdropProps {
  open: boolean
  message?: string
}

export const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ 
  open, 
  message = '処理中...' 
}) => (
  <Backdrop
    sx={{
      color: '#fff',
      zIndex: (theme) => theme.zIndex.modal + 1,
      backgroundColor: 'rgba(29, 27, 32, 0.48)',
    }}
    open={open}
  >
    <Box 
      sx={{ 
        textAlign: 'center',
        p: 3,
        borderRadius: 3,
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <CircularProgress 
        color="primary" 
        size={48}
        sx={{ mb: 2 }}
      />
      <Typography 
        variant="h6" 
        color="white" 
        sx={{ fontWeight: 500 }}
      >
        {message}
      </Typography>
    </Box>
  </Backdrop>
)

// Empty state component
export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  sx?: SxProps<Theme>
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  sx
}) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 6,
      px: 3,
      ...sx
    }}
  >
    <Box sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}>
      {icon}
    </Box>
    <Typography 
      variant="h6" 
      color="text.primary" 
      gutterBottom
      sx={{ fontWeight: 500 }}
    >
      {title}
    </Typography>
    {description && (
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
      >
        {description}
      </Typography>
    )}
    {action}
  </Box>
)