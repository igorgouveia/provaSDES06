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

type ConviteFormProps = {
  token: string
}

export function ConviteForm({ token }: ConviteFormProps) {
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
      const data = {
        token,
        name: formData.get('name'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
      }

      if (data.password !== data.confirmPassword) {
        setErrors({ confirmPassword: 'As senhas não coincidem' })
        return
      }

      const response = await fetch('/api/auth/aceitar-convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao aceitar convite')
      }

      toast({
        title: 'Convite aceito com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success',
        duration: 3000
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      toast({
        title: 'Erro ao aceitar convite',
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
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel>Nome</FormLabel>
          <Input
            name="name"
            autoComplete="name"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password} isRequired>
          <FormLabel>Senha</FormLabel>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword} isRequired>
          <FormLabel>Confirmar Senha</FormLabel>
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
          Aceitar Convite
        </Button>
      </Stack>
    </form>
  )
} 