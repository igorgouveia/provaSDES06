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
import { ResetPasswordForm } from './components/ResetPasswordForm'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <Text color="red.500">
        Token de recuperação inválido ou expirado.
      </Text>
    )
  }

  return <ResetPasswordForm token={token} />
}

export default function ResetPasswordPage() {
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="lg">Redefinir Senha</Heading>
          <Text>Digite sua nova senha</Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow="sm"
          borderRadius="xl"
        >
          <Suspense fallback={<Text>Carregando...</Text>}>
            <ResetPasswordContent />
          </Suspense>
        </Box>
      </Stack>
    </Container>
  )
} 