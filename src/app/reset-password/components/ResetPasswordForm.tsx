'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  FormErrorMessage
} from '@chakra-ui/react'

type ResetPasswordFormProps = {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string

      if (password !== confirmPassword) {
        setErrors({ confirmPassword: 'As senhas não coincidem' })
        return
      }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      if (!response.ok) {
        throw new Error('Erro ao redefinir senha')
      }

      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success',
        duration: 3000
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.password} isRequired>
          <FormLabel>Nova Senha</FormLabel>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword} isRequired>
          <FormLabel>Confirmar Nova Senha</FormLabel>
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
          />
          <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
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
  )
} 