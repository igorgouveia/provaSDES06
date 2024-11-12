'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Link,
  FormErrorMessage
} from '@chakra-ui/react'
import NextLink from 'next/link'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const toast = useToast()

  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {}
    
    if (!data.name || data.name.length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
    }
    if (!data.email || !data.email.includes('@')) {
      newErrors.email = 'Email inválido'
    }
    if (!data.password || data.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string
      }

      if (!validateForm(data)) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar conta')
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success',
        duration: 3000
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Erro no registro:', error)
      toast({
        title: 'Erro ao criar conta',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" align="center">
          <Heading size="lg">Criar Conta</Heading>
          <Text>Preencha os dados para se registrar</Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg="white"
          boxShadow="sm"
          borderRadius="xl"
        >
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing="6">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Nome</FormLabel>
                <Input name="name" />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password} isRequired>
                <FormLabel>Senha</FormLabel>
                <Input name="password" type="password" />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword} isRequired>
                <FormLabel>Confirmar Senha</FormLabel>
                <Input name="confirmPassword" type="password" />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
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

              <Text textAlign="center">
                Já tem uma conta?{' '}
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