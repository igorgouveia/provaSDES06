'use client'

import { useEffect } from 'react'
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
  VStack,
} from '@chakra-ui/react'
import { TransacaoForm } from './components/TransacaoForm'
import { TransacaoLista } from './components/TransacaoLista'
import { useApp } from '@/contexts/AppContext'

export default function TransacoesPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, refreshMoradores } = useApp()

  useEffect(() => {
    refreshMoradores()
  }, [refreshMoradores])

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Transações Internas</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Nova Transação
        </Button>
      </Box>

      <VStack spacing={8} align="stretch">
        <TransacaoLista />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nova Transação</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TransacaoForm onSuccess={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 