'use client'

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Text,
  Card,
  CardBody
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CompleteRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      token,
      cpf: formData.get('cpf'),
      dataNascimento: formData.get('dataNascimento'),
      chavePix: formData.get('chavePix'),
      banco: formData.get('banco'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    }

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('As senhas não coincidem')
      }

      const response = await fetch('/api/auth/complete-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao completar cadastro')
      }

      toast({
        title: 'Cadastro completado com sucesso!',
        description: 'Você já pode fazer login.',
        status: 'success'
      })

      router.push('/login')
    } catch (error) {
      toast({
        title: 'Erro ao completar cadastro',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Container maxW="container.sm" py={8}>
        <Card>
          <CardBody>
            <Text textAlign="center" color="red.500">
              Link de convite inválido
            </Text>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={8}>
        <Heading size="lg">Complete seu Cadastro</Heading>

        <Card w="full">
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>CPF</FormLabel>
                  <Input name="cpf" placeholder="000.000.000-00" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Input name="dataNascimento" type="date" />
                </FormControl>

                <FormControl>
                  <FormLabel>Chave Pix</FormLabel>
                  <Input name="chavePix" />
                </FormControl>

                <FormControl>
                  <FormLabel>Banco</FormLabel>
                  <Input name="banco" />
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
                  isLoading={isLoading}
                  width="full"
                >
                  Completar Cadastro
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 