import { createTheme, ThemeOptions } from '@mui/material/styles'

export const md3Colors = {
  primary: {
    main: '#6750a4',
    light: '#9a82db',
    dark: '#4f378b',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#625b71',
    light: '#8b8298',
    dark: '#4a4458',
    contrastText: '#ffffff',
  },
  tertiary: {
    main: '#7d5260',
    light: '#a67c89',
    dark: '#633b48',
    contrastText: '#ffffff',
  },
  surface: {
    main: '#fffbfe',
    variant: '#e7e0ec',
    dim: '#ded8e1',
    bright: '#fffbfe',
    containerLowest: '#ffffff',
    containerLow: '#f7f2fa',
    container: '#f1ecf4',
    containerHigh: '#ebe6ee',
    containerHighest: '#e6e1e9',
  },
  outline: {
    main: '#79747e',
    variant: '#cac4d0',
  },
}

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: md3Colors.primary,
    secondary: md3Colors.secondary,
    background: {
      default: md3Colors.surface.main,
      paper: md3Colors.surface.containerLow,
    },
    text: {
      primary: '#1d1b20',
      secondary: '#49454f',
    },
    divider: md3Colors.outline.variant,
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Noto Sans JP',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.334,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
          },
        },
        contained: {
          background: md3Colors.primary.main,
          color: md3Colors.primary.contrastText,
          '&:hover': {
            background: '#5a4fcf',
          },
        },
        outlined: {
          borderColor: md3Colors.outline.main,
          color: md3Colors.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.08)',
            borderColor: md3Colors.primary.main,
          },
        },
        text: {
          color: md3Colors.primary.main,
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: md3Colors.surface.container,
          boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
          '&:hover': {
            boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: md3Colors.surface.containerLow,
          boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        },
        elevation1: {
          boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        },
        elevation2: {
          boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
        },
        elevation3: {
          boxShadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.30)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: md3Colors.surface.container,
          color: md3Colors.primary.main,
          boxShadow: 'none',
          borderBottom: `1px solid ${md3Colors.outline.variant}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlined: {
          borderColor: md3Colors.outline.main,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: md3Colors.outline.main,
            },
            '&:hover fieldset': {
              borderColor: md3Colors.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: md3Colors.primary.main,
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '2px 0',
          '&:hover': {
            backgroundColor: 'rgba(103, 80, 164, 0.08)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: md3Colors.surface.variant,
        },
        bar: {
          borderRadius: 4,
          backgroundColor: md3Colors.primary.main,
        },
      },
    },
  },
}

export const theme = createTheme(themeOptions)