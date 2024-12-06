'use client'

import { Box } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession()

  return (
    <Box minH="100vh">
      <Navbar />
      {session && <Sidebar />}
      <Box
        ml={session ? '250px' : 0}
        pt={4}
        transition="margin 0.2s"
      >
        {children}
      </Box>
    </Box>
  )
} 