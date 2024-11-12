'use client'

import { useState } from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

export function ConviteMorador() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email')

    try {
      const response = await fetch('/api/republica/convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar convite')
      }

      toast({
        title: 'Convite enviado com sucesso!',
        status: 'success'
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Erro ao enviar convite',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen}>
        Convidar Morador
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Convidar Morador</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Email do Morador</FormLabel>
                <Input name="email" type="email" />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
              >
                Enviar Convite
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
} 