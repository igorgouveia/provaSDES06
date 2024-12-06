'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  Card,
  CardBody
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'

type PesoMorador = {
  moradorId: string
  nome: string
  peso: number
}

export default function PesosPage() {
  const [pesos, setPesos] = useState<PesoMorador[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { state } = useApp()
  const toast = useToast()

  useEffect(() => {
    if (state.moradores) {
      setPesos(state.moradores.map(m => ({
        moradorId: m.id,
        nome: m.nome,
        peso: m.peso || 1
      })))
    }
  }, [state.moradores])

  const handleSalvar = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/pesos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesos })
      })

      if (!response.ok) throw new Error('Erro ao salvar pesos')

      toast({
        title: 'Pesos atualizados com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar pesos',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Pesos das Contas Fixas</Heading>

        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Morador</Th>
                  <Th>Peso</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pesos.map((peso, index) => (
                  <Tr key={peso.moradorId}>
                    <Td>{peso.nome}</Td>
                    <Td>
                      <NumberInput
                        value={peso.peso}
                        min={0}
                        max={10}
                        step={0.1}
                        onChange={(_, value) => {
                          const newPesos = [...pesos]
                          newPesos[index].peso = value
                          setPesos(newPesos)
                        }}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Button
              mt={4}
              colorScheme="blue"
              onClick={handleSalvar}
              isLoading={isLoading}
            >
              Salvar Pesos
            </Button>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 