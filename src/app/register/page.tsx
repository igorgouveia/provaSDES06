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
import { z } from 'zod'
import { useFormValidation } from '@/hooks/useFormValidation'
import { Form, FormField } from '@/components/shared/Form'

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { errors, validate } = useFormValidation(registerSchema)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string
      }

      if (!validate(data)) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar conta')
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

        <Form onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Criar Conta">
          <FormField
            label="Nome"
            name="name"
            error={errors.name}
            isRequired
          >
            <Input name="name" />
          </FormField>

          <FormField
            label="Email"
            name="email"
            error={errors.email}
            isRequired
          >
            <Input name="email" type="email" />
          </FormField>

          <FormField
            label="Senha"
            name="password"
            error={errors.password}
            isRequired
          >
            <Input name="password" type="password" />
          </FormField>

          <FormField
            label="Confirmar Senha"
            name="confirmPassword"
            error={errors.confirmPassword}
            isRequired
          >
            <Input name="confirmPassword" type="password" />
          </FormField>
        </Form>

        <Text textAlign="center">
          Já tem uma conta?{' '}
          <Link as={NextLink} href="/login" color="blue.500">
            Faça login
          </Link>
        </Text>
      </Stack>
    </Container>
  )
} 