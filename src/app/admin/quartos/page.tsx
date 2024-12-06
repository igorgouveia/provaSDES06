'use client'

import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Badge,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { QuartoForm } from './components/QuartoForm'
import { Calculadora } from './components/Calculadora'
import { ConfiguracaoRepublicaForm } from './components/ConfiguracaoRepublicaForm'

type Republica = {
  id: string
  nome: string
  endereco: string
  descricao?: string
  metragemTotal: number | null
  valorAluguel: number | null
  dataUltimoFechamento: string | null
  adminId: string
  createdAt: string
  updatedAt: string
}

type Quarto = {
  id: string
  nome: string
  valor: number
  metragem: number
  numMoradores: number
  descricao?: string
  moradores: Array<{
    id: string
    nome: string
  }>
}

export default function QuartosPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuarto, setSelectedQuarto] = useState<Quarto | null>(null)
  const [republica, setRepublica] = useState<Republica | null>(null)
  const [showConfigAlert, setShowConfigAlert] = useState(false)

  const fetchQuartos = async () => {
    try {
      const response = await fetch('/api/republica/quartos')
      if (!response.ok) throw new Error('Erro ao buscar quartos')
      const data = await response.json()
      setQuartos(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRepublica = async () => {
    try {
      const response = await fetch('/api/republica')
      if (!response.ok) throw new Error('Erro ao buscar república')
      const data = await response.json()
      console.log('República data:', data)
      setRepublica(data)
      setShowConfigAlert(!data.metragemTotal || !data.valorAluguel)
    } catch (error) {
      console.error('Erro ao buscar república:', error)
    }
  }

  useEffect(() => {
    fetchQuartos()
    fetchRepublica()
  }, [])

  const handleNovoQuarto = () => {
    if (!republica?.metragemTotal || !republica?.valorAluguel) {
      setShowConfigAlert(true)
      return
    }
    setSelectedQuarto(null)
    onOpen()
  }

  const handleRecalculationSuccess = () => {
    fetchQuartos()
    fetchRepublica()
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {showConfigAlert && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Configuração Necessária</AlertTitle>
              <AlertDescription>
                Configure a metragem total e o valor do aluguel da república antes de cadastrar quartos.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Quartos</Heading>
          <Button colorScheme="blue" onClick={handleNovoQuarto}>
            Novo Quarto
          </Button>
        </Box>

        <HStack spacing={4} align="stretch">
          {/* Lista de Quartos */}
          <Card flex={1}>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th isNumeric>Metragem</Th>
                    <Th isNumeric>Moradores</Th>
                    <Th isNumeric>Valor Total</Th>
                    <Th isNumeric>Valor por Morador</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {quartos.map(quarto => (
                    <Tr key={quarto.id}>
                      <Td>{quarto.nome}</Td>
                      <Td isNumeric>{quarto.metragem} m²</Td>
                      <Td isNumeric>{quarto.numMoradores}</Td>
                      <Td isNumeric>R$ {quarto.valor.toFixed(2)}</Td>
                      <Td isNumeric>R$ {(quarto.valor / quarto.numMoradores).toFixed(2)}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => {
                            setSelectedQuarto(quarto)
                            onOpen()
                          }}
                        >
                          Editar
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <VStack spacing={4} w="400px">
            {/* Configurações */}
            <Card w="full">
              <CardBody>
                <VStack spacing={4}>
                  <Text fontSize="xl" fontWeight="bold">
                    Configurações
                  </Text>
                  <ConfiguracaoRepublicaForm
                    initialData={{
                      metragemTotal: republica?.metragemTotal || undefined,
                      valorAluguel: republica?.valorAluguel || undefined
                    }}
                    onSuccess={handleRecalculationSuccess}
                  />
                </VStack>
              </CardBody>
            </Card>

            {/* Calculadora */}
            <Card w="full">
              <CardBody>
                <Calculadora />
              </CardBody>
            </Card>
          </VStack>
        </HStack>

        {/* Modal de Quarto */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedQuarto ? 'Editar Quarto' : 'Novo Quarto'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <QuartoForm
                quarto={selectedQuarto}
                onSuccess={() => {
                  onClose()
                  setSelectedQuarto(null)
                  fetchQuartos()
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
} 