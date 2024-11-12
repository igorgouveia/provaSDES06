'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
} from '@chakra-ui/react'
import { ConviteForm } from './components/ConviteForm'

function ConviteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <Text color="red.500">
        Link de convite inválido ou expirado.
      </Text>
    )
  }

  return <ConviteForm token={token} />
}

export default function ConvitePage() {
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="lg">Aceitar Convite</Heading>
          <Text>Complete seu cadastro para entrar na república</Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow="sm"
          borderRadius="xl"
        >
          <Suspense fallback={<Text>Carregando...</Text>}>
            <ConviteContent />
          </Suspense>
        </Box>
      </Stack>
    </Container>
  )
} 