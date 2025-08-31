import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  Button,
  useTheme,
  alpha
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  Refresh,
  Help,
  GitHub,
  Info
} from '@mui/icons-material'
import { Chip, Divider } from '@mui/material'

interface HeaderProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onReset: () => void
}

const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onReset
}) => {
  const theme = useTheme()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        background: alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            LangPack Studio
          </Typography>
          
          <Tooltip title="Version 1.0.1-dev">
            <Chip
              label="v1.0.1-dev"
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                borderColor: 'primary.main',
                color: 'primary.main',
              }}
            />
          </Tooltip>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="ヘルプ">
            <IconButton
              onClick={() => window.open('https://github.com/Sumire-Labs/LangPack-Studio/wiki', '_blank')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Help />
            </IconButton>
          </Tooltip>

          <Tooltip title="GitHub">
            <IconButton
              onClick={() => window.open('https://github.com/Sumire-Labs/LangPack-Studio', '_blank')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <GitHub />
            </IconButton>
          </Tooltip>

          <Tooltip title="リセット">
            <IconButton
              onClick={onReset}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'error.main',
                },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Tooltip title={darkMode ? 'ライトモード' : 'ダークモード'}>
            <IconButton
              onClick={onToggleDarkMode}
              sx={{
                color: 'text.secondary',
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header