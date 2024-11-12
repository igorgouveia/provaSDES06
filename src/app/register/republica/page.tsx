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
  Textarea,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress
} from '@chakra-ui/react'
import { useFormValidation } from '@/hooks/useFormValidation'
import { republicaSchema } from '@/lib/validations/republica'
import { Form, FormField } from '@/components/shared/Form'

export default function RegisterRepublicaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const router = useRouter()
  const toast = useToast()
  const { errors, validate } = useFormValidation(republicaSchema)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus('submitting')

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        nome: formData.get('nome') as string,
        endereco: formData.get('endereco') as string,
        descricao: formData.get('descricao') as string,
        adminName: formData.get('adminName') as string,
        adminEmail: formData.get('adminEmail') as string,
        adminPassword: formData.get('adminPassword') as string
      }

      if (!validate(data)) {
        setIsLoading(false)
        setStatus('error')
        return
      }

      console.log('Enviando dados:', data) // Debug

      const response = await fetch('/api/republica/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar república')
      }

      setStatus('success')
      toast({
        title: 'República criada com sucesso!',
        description: 'Você será redirecionado para o login',
        status: 'success',
        duration: 3000
      })

      // Aguardar um pouco antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push('/login')

    } catch (error) {
      console.error('Erro no registro:', error)
      setStatus('error')
      toast({
        title: 'Erro ao criar república',
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
          <Heading size="lg">Registrar República</Heading>
          <Text>Crie sua república e torne-se administrador</Text>
        </Stack>

        {status === 'submitting' && (
          <Box>
            <Progress size="xs" isIndeterminate colorScheme="blue" />
            <Alert status="info" mt={4}>
              <AlertIcon />
              <AlertTitle>Processando...</AlertTitle>
              <AlertDescription>
                Aguarde enquanto criamos sua república
              </AlertDescription>
            </Alert>
          </Box>
        )}

        {status === 'success' && (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>República criada!</AlertTitle>
            <AlertDescription>
              Redirecionando para a página de login...
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Erro!</AlertTitle>
            <AlertDescription>
              Ocorreu um erro ao criar a república. Por favor, tente novamente.
            </AlertDescription>
          </Alert>
        )}

        <Form onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Criar República">
          <FormField
            label="Nome da República"
            name="nome"
            error={errors.nome}
            isRequired
          >
            <Input name="nome" isDisabled={isLoading} />
          </FormField>

          <FormField
            label="Endereço"
            name="endereco"
            error={errors.endereco}
            isRequired
          >
            <Input name="endereco" isDisabled={isLoading} />
          </FormField>

          <FormField
            label="Descrição"
            name="descricao"
          >
            <Textarea name="descricao" isDisabled={isLoading} />
          </FormField>

          <FormField
            label="Nome do Administrador"
            name="adminName"
            error={errors.adminName}
            isRequired
          >
            <Input name="adminName" isDisabled={isLoading} />
          </FormField>

          <FormField
            label="Email do Administrador"
            name="adminEmail"
            error={errors.adminEmail}
            isRequired
          >
            <Input name="adminEmail" type="email" isDisabled={isLoading} />
          </FormField>

          <FormField
            label="Senha"
            name="adminPassword"
            error={errors.adminPassword}
            isRequired
          >
            <Input name="adminPassword" type="password" isDisabled={isLoading} />
          </FormField>
        </Form>
      </Stack>
    </Container>
  )
} 