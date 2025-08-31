import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
  Fade,
  Zoom,
  IconButton
} from '@mui/material'
import {
  Language,
  Upload,
  Translate,
  Build,
  ArrowForward,
  PlayArrow,
  AutoAwesome,
  Speed,
  Security,
  Close
} from '@mui/icons-material'

interface WelcomeScreenProps {
  onStart: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const theme = useTheme()
  const [showFeatures, setShowFeatures] = useState(false)

  const features = [
    {
      icon: <Upload sx={{ fontSize: 40 }} />,
      title: '簡単インポート',
      description: 'ドラッグ&ドロップでJSON/LANGファイルを読み込み',
      color: '#6750a4'
    },
    {
      icon: <Translate sx={{ fontSize: 40 }} />,
      title: '自動翻訳',
      description: '複数の翻訳APIに対応、高品質な翻訳を実現',
      color: '#625b71'
    },
    {
      icon: <Build sx={{ fontSize: 40 }} />,
      title: 'パック生成',
      description: 'ワンクリックでMinecraft用リソースパックを作成',
      color: '#7d5260'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
      title: 'スマートUI',
      description: 'Material Design 3による直感的な操作体験',
      color: '#9c88ff'
    }
  ]

  const steps = [
    '言語ファイルをインポート',
    '翻訳設定と実行',
    'リソースパック生成',
    'ダウンロードして使用'
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.1),
          filter: 'blur(100px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.1),
          filter: 'blur(80px)',
        }}
      />

      <Container maxWidth="lg">
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            {/* Logo */}
            <Zoom in timeout={800}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: 4,
                  background: alpha('#ffffff', 0.1),
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha('#ffffff', 0.2)}`,
                  mb: 4,
                }}
              >
                <Language sx={{ fontSize: 64, color: '#ffffff' }} />
              </Box>
            </Zoom>

            {/* Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: '#ffffff',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              LangPack Studio
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              sx={{
                color: alpha('#ffffff', 0.9),
                mb: 4,
                fontWeight: 300,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Minecraft Mod言語翻訳リソースパック作成ツール
            </Typography>

            {/* CTA Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={onStart}
                startIcon={<PlayArrow />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  bgcolor: '#ffffff',
                  color: '#6750a4',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                今すぐ始める
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowFeatures(!showFeatures)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#ffffff',
                    bgcolor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                詳細を見る
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Features Grid */}
        {showFeatures && (
          <Fade in timeout={500}>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in timeout={500 + index * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        background: alpha('#ffffff', 0.1),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha('#ffffff', 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          background: alpha('#ffffff', 0.15),
                          boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(feature.color, 0.2),
                            mb: 2,
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { color: '#ffffff' } })}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ color: '#ffffff', mb: 1, fontWeight: 600 }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: alpha('#ffffff', 0.8) }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}

        {/* Process Steps */}
        <Fade in timeout={1200}>
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              background: alpha('#ffffff', 0.1),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha('#ffffff', 0.2)}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#ffffff', mb: 3, textAlign: 'center' }}
            >
              簡単4ステップで翻訳パック作成
            </Typography>
            <Stepper alternativeLabel sx={{ bgcolor: 'transparent' }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: alpha('#ffffff', 0.8),
                        fontSize: '0.9rem',
                      },
                      '& .MuiStepIcon-root': {
                        color: alpha('#ffffff', 0.3),
                        '&.Mui-active': {
                          color: '#ffffff',
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Fade>
      </Container>
    </Box>
  )
}

export default WelcomeScreen