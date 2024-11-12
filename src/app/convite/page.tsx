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

export default function ConvitePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      token,
      name: formData.get('name'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    }

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      const response = await fetch('/api/auth/aceitar-convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao aceitar convite')
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success'
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Erro ao aceitar convite',
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
          <Heading size="lg">Aceitar Convite</Heading>
          <Text>Complete seu cadastro para entrar na república</Text>
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
                <FormLabel>Nome</FormLabel>
                <Input name="name" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <Input name="password" type="password" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar Senha</FormLabel>
                <Input name="confirmPassword" type="password" />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Criar Conta
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
} 