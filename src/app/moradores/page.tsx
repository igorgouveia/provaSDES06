'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast
} from '@chakra-ui/react'
import { MoradorForm } from './components/MoradorForm'
import { MoradorLista } from './components/MoradorLista'

type Morador = {
  id: string
  nome: string
  apelido: string
  cpf: string
  dataNascimento: string
  quarto: string
  chavePix?: string
  banco?: string
  pesoContas: number
  ativo?: boolean
}

export default function MoradoresPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMorador, setSelectedMorador] = useState<Morador | null>(null)
  const toast = useToast()

  const fetchMoradores = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/republica/moradores')
      if (!response.ok) throw new Error('Erro ao buscar moradores')
      
      const data = await response.json()
      setMoradores(data)
    } catch (error) {
      console.error('Erro ao buscar moradores:', error)
      toast({
        title: 'Erro ao carregar moradores',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (morador: Morador) => {
    setSelectedMorador(morador)
    onOpen()
  }

  const handleDelete = async (morador: Morador) => {
    if (!window.confirm(`Tem certeza que deseja remover ${morador.nome}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/republica/moradores/${morador.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao remover morador')

      toast({
        title: 'Morador removido com sucesso',
        status: 'success'
      })

      fetchMoradores()
    } catch (error) {
      console.error('Erro ao remover morador:', error)
      toast({
        title: 'Erro ao remover morador',
        status: 'error'
      })
    }
  }

  const handleToggleStatus = async (morador: Morador) => {
    try {
      const response = await fetch(`/api/republica/moradores/${morador.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !morador.ativo })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      toast({
        title: `Morador ${morador.ativo ? 'desativado' : 'ativado'} com sucesso`,
        status: 'success'
      })

      fetchMoradores()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro ao atualizar status',
        status: 'error'
      })
    }
  }

  useEffect(() => {
    fetchMoradores()
  }, [])

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Moradores</Heading>
        <Button colorScheme="blue" onClick={() => {
          setSelectedMorador(null)
          onOpen()
        }}>
          Novo Morador
        </Button>
      </Box>

      <MoradorLista 
        moradores={moradores} 
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedMorador ? 'Editar Morador' : 'Novo Morador'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <MoradorForm 
              morador={selectedMorador}
              onSuccess={() => {
                onClose()
                fetchMoradores()
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 