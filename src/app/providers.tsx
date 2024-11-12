'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { AppProvider } from '@/contexts/AppContext'
import { theme } from '@/styles/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider theme={theme}>
        <AppProvider>
          {children}
        </AppProvider>
      </ChakraProvider>
    </SessionProvider>
  )
} 