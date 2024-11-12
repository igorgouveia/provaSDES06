import { extendTheme } from '@chakra-ui/react'

const colors = {
  brand: {
    50: '#E6F7FF',
    100: '#BAE7FF',
    200: '#91D5FF',
    300: '#69C0FF',
    400: '#40A9FF',
    500: '#1890FF', // Primary
    600: '#096DD9',
    700: '#0050B3',
    800: '#003A8C',
    900: '#002766'
  },
  accent: {
    50: '#FFF0F6',
    100: '#FFD6E7',
    200: '#FFADD2',
    300: '#FF85C0',
    400: '#F759AB',
    500: '#EB2F96', // Secondary
    600: '#C41D7F',
    700: '#9E1068',
    800: '#780650',
    900: '#520339'
  },
  success: {
    50: '#F6FFED',
    100: '#D9F7BE',
    200: '#B7EB8F',
    300: '#95DE64',
    400: '#73D13D',
    500: '#52C41A',
    600: '#389E0D',
    700: '#237804',
    800: '#135200',
    900: '#092B00'
  }
}

const fonts = {
  heading: '"Plus Jakarta Sans", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif'
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'xl'
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        },
        _active: {
          bg: 'brand.700',
          transform: 'translateY(0)'
        },
        transition: 'all 0.2s'
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        },
        _active: {
          bg: 'brand.100',
          transform: 'translateY(0)'
        },
        transition: 'all 0.2s'
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-2px)'
        },
        _active: {
          bg: 'brand.100',
          transform: 'translateY(0)'
        },
        transition: 'all 0.2s'
      }
    }
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        boxShadow: 'lg',
        overflow: 'hidden',
        transition: 'all 0.2s',
        _hover: {
          transform: 'translateY(-4px)',
          boxShadow: 'xl'
        }
      }
    }
  },
  Link: {
    baseStyle: {
      transition: 'all 0.2s',
      _hover: {
        textDecoration: 'none',
        color: 'brand.500'
      }
    }
  }
}

const styles = {
  global: {
    body: {
      bg: 'gray.50'
    }
  }
}

export const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  }
}) 