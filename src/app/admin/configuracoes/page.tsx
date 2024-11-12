'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

type RepublicaData = {
  nome: string
  endereco: string
  descricao?: string
}

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [republica, setRepublica] = useState<RepublicaData | null>(null)
  const { isAdmin } = useApp()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
        status: 'error',
        duration: 3000
      })
      router.push('/dashboard')
      return
    }

    fetchRepublica()
  }, [isAdmin, router, toast])

  const fetchRepublica = async () => {
    try {
      const response = await fetch('/api/republica')
      const data = await response.json()
      setRepublica(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        status: 'error'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        nome: formData.get('nome'),
        endereco: formData.get('endereco'),
        descricao: formData.get('descricao')
      }

      const response = await fetch('/api/republica', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar república')
      }

      toast({
        title: 'Configurações atualizadas com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar configurações',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Configurações da República</Heading>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome da República</FormLabel>
                  <Input
                    name="nome"
                    defaultValue={republica?.nome}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Endereço</FormLabel>
                  <Input
                    name="endereco"
                    defaultValue={republica?.endereco}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Textarea
                    name="descricao"
                    defaultValue={republica?.descricao}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  width="full"
                >
                  Salvar Alterações
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 