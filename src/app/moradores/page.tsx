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
} from '@chakra-ui/react'
import { MoradorForm } from './components/MoradorForm'
import { MoradorLista } from './components/MoradorLista'
import { useApp } from '@/contexts/AppContext'

export default function MoradoresPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, refreshMoradores } = useApp()

  useEffect(() => {
    refreshMoradores()
  }, [refreshMoradores])

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Moradores</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Novo Morador
        </Button>
      </Box>

      <MoradorLista moradores={state.moradores || []} />

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Morador</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <MoradorForm onSuccess={() => {
              onClose()
              refreshMoradores()
            }} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 