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
import { ItemCompraForm } from './components/ItemCompraForm'
import { ItemCompraLista } from './components/ItemCompraLista'
import { useApp } from '@/contexts/AppContext'

export default function ComprasPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, refreshMoradores } = useApp()

  useEffect(() => {
    refreshMoradores()
  }, [refreshMoradores])

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Lista de Compras</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Adicionar Item
        </Button>
      </Box>

      <VStack spacing={8} align="stretch">
        <ItemCompraLista />
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ItemCompraForm onSuccess={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 