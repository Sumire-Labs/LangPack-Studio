import React from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Chip,
  Tooltip,
  Collapse,
  Badge,
  alpha,
  useTheme
} from '@mui/material'
import {
  Upload,
  Translate,
  Build,
  Preview,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Language,
  Architecture,
  Visibility,
  CheckCircle,
  Error,
  Home,
  Settings
} from '@mui/icons-material'

interface SidebarProps {
  activeView: 'import' | 'translate' | 'generate' | 'preview'
  onViewChange: (view: 'import' | 'translate' | 'generate' | 'preview') => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  fileCount: number
  translationCount: number
  isMobile: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  collapsed,
  onCollapsedChange,
  fileCount,
  translationCount,
  isMobile
}) => {
  const theme = useTheme()
  const drawerWidth = collapsed ? 80 : 280

  const menuItems = [
    {
      id: 'import' as const,
      label: 'ファイルインポート',
      icon: <Upload />,
      badge: fileCount,
      badgeColor: 'primary' as const,
      description: '言語ファイルを読み込み'
    },
    {
      id: 'translate' as const,
      label: '翻訳',
      icon: <Translate />,
      badge: translationCount,
      badgeColor: 'success' as const,
      description: '自動翻訳・編集',
      disabled: fileCount === 0
    },
    {
      id: 'generate' as const,
      label: 'パック生成',
      icon: <Build />,
      description: 'リソースパック作成',
      disabled: fileCount === 0
    },
    {
      id: 'preview' as const,
      label: 'プレビュー',
      icon: <Preview />,
      description: '結果確認',
      disabled: fileCount === 0
    }
  ]

  const getStepNumber = (id: string) => {
    return menuItems.findIndex(item => item.id === id) + 1
  }

  const getCurrentStep = () => {
    return getStepNumber(activeView)
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={!isMobile || !collapsed}
      onClose={() => isMobile && onCollapsedChange(true)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          minHeight: 64,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Language sx={{ color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                LangPack
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Studio
              </Typography>
            </Box>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => onCollapsedChange(!collapsed)}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Progress Indicator */}
      {!collapsed && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            進捗状況
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            {[1, 2, 3, 4].map((step) => (
              <Box
                key={step}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: step <= getCurrentStep()
                    ? 'primary.main'
                    : 'action.disabled',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item, index) => {
          const isActive = activeView === item.id
          const isCompleted = getCurrentStep() > index + 1

          return (
            <ListItem
              key={item.id}
              disablePadding
              sx={{ mb: 0.5 }}
            >
              <Tooltip
                title={collapsed ? item.label : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => !item.disabled && onViewChange(item.id)}
                  disabled={item.disabled}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    position: 'relative',
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    '&::before': isActive ? {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                    } : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : 48,
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Badge
                      badgeContent={item.badge}
                      color={item.badgeColor}
                      invisible={!item.badge || collapsed}
                    >
                      <Box sx={{ position: 'relative' }}>
                        {item.icon}
                        {isCompleted && (
                          <CheckCircle
                            sx={{
                              position: 'absolute',
                              right: -8,
                              bottom: -8,
                              fontSize: 14,
                              color: 'success.main',
                              bgcolor: 'background.paper',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </Box>
                    </Badge>
                  </ListItemIcon>
                  {!collapsed && (
                    <>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? 'primary.main' : 'text.primary',
                            }}
                          >
                            {item.label}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ opacity: 0.8 }}
                          >
                            {item.description}
                          </Typography>
                        }
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          color={item.badgeColor}
                          sx={{ height: 20, minWidth: 32 }}
                        />
                      )}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        {!collapsed && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              mb: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              統計
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption">ファイル</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {fileCount}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">翻訳</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {translationCount}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{ borderRadius: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 48 }}>
                <Settings />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="設定" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar