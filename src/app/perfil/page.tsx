'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  VStack,
  Text
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'

export default function PerfilPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword')
    }

    try {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar perfil')
      }

      toast({
        title: 'Perfil atualizado com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Perfil</Heading>

        <Box
          p={6}
          bg="white"
          boxShadow="sm"
          borderRadius="lg"
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Text>{session?.user?.email}</Text>
              </FormControl>

              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input 
                  name="name" 
                  defaultValue={session?.user?.name || ''}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Senha Atual</FormLabel>
                <Input 
                  name="currentPassword" 
                  type="password"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Nova Senha</FormLabel>
                <Input 
                  name="newPassword" 
                  type="password"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <Input 
                  name="confirmPassword" 
                  type="password"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
              >
                Atualizar Perfil
              </Button>
            </Stack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
} 