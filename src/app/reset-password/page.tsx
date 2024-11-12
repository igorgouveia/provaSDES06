'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Container,
  Heading,
} from '@chakra-ui/react'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    try {
      if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao redefinir senha')
      }

      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success'
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Text textAlign="center" color="red.500">
          Token inválido ou expirado
        </Text>
      </Container>
    )
  }

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
          bg={{ base: 'transparent', sm: 'bg-surface' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              <FormControl isRequired>
                <FormLabel>Nova Senha</FormLabel>
                <Input name="password" type="password" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <Input name="confirmPassword" type="password" />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Redefinir Senha
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
} 