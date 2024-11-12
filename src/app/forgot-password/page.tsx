'use client'

import { useState } from 'react'
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
  Link
} from '@chakra-ui/react'
import NextLink from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar email')
      }

      setEmailSent(true)
    } catch (error) {
      toast({
        title: 'Erro ao enviar email',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Container maxW="lg" py={{ base: '12', md: '24' }}>
        <Stack spacing="8" textAlign="center">
          <Heading size="lg">Email Enviado</Heading>
          <Text>
            Se existe uma conta com este email, você receberá um link para redefinir sua senha.
          </Text>
          <Link as={NextLink} href="/login" color="blue.500">
            Voltar para o login
          </Link>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="lg">Esqueceu sua senha?</Heading>
          <Text>Digite seu email para receber um link de recuperação</Text>
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
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Enviar Link
              </Button>

              <Text textAlign="center">
                Lembrou sua senha?{' '}
                <Link as={NextLink} href="/login" color="blue.500">
                  Faça login
                </Link>
              </Text>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
} 