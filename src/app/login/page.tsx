'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
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

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const toast = useToast()

  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {}
    
    if (!data.email || !data.email.includes('@')) {
      newErrors.email = 'Email inválido'
    }
    if (!data.password) {
      newErrors.password = 'Senha é obrigatória'
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
        email: formData.get('email') as string,
        password: formData.get('password') as string
      }

      if (!validateForm(data)) {
        setIsLoading(false)
        return
      }

      const result = await signIn('credentials', {
        ...data,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/dashboard')
      router.refresh()

    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Credenciais inválidas',
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
          <Heading size="lg">Login</Heading>
          <Text>Entre com sua conta para continuar</Text>
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

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Entrar
              </Button>

              <Stack spacing={4}>
                <Text textAlign="center">
                  Não tem uma conta?{' '}
                  <Link as={NextLink} href="/register/republica" color="blue.500">
                    Registre sua República
                  </Link>
                </Text>
                <Text textAlign="center">
                  <Link as={NextLink} href="/forgot-password" color="blue.500">
                    Esqueceu sua senha?
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
} 