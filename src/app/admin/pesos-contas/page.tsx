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
  Card,
  CardBody,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  Select,
  FormControl,
  FormLabel,
  Text
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type ContaFixa = {
  id: string
  nome: string
  tipoValor: 'FIXO' | 'VARIAVEL'
  vencimento: number
  descricao?: string
}

type Morador = {
  id: string
  nome: string
}

type PesoConta = {
  moradorId: string
  contaFixaId: string
  peso: number
}

export default function PesosContasPage() {
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([])
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [pesos, setPesos] = useState<PesoConta[]>([])
  const [contaSelecionada, setContaSelecionada] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (contaSelecionada) {
      fetchPesos(contaSelecionada)
    }
  }, [contaSelecionada])

  const fetchData = async () => {
    try {
      setIsInitialLoading(true)
      const [contasResponse, moradoresResponse] = await Promise.all([
        fetch('/api/republica/contas-fixas'),
        fetch('/api/republica/moradores')
      ])

      if (!contasResponse.ok || !moradoresResponse.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const contas = await contasResponse.json()
      const moradores = await moradoresResponse.json()

      console.log('Moradores carregados:', moradores)

      setContasFixas(contas)
      setMoradores(moradores)

      if (contas.length > 0) {
        setContaSelecionada(contas[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados necessários.',
        status: 'error'
      })
    } finally {
      setIsInitialLoading(false)
    }
  }

  const fetchPesos = async (contaId: string) => {
    try {
      const response = await fetch(`/api/republica/contas-fixas/${contaId}/pesos`)
      const data = await response.json()
      setPesos(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar pesos',
        status: 'error'
      })
    }
  }

  const handlePesoChange = (moradorId: string, novoPeso: number) => {
    setPesos(pesos => {
      const index = pesos.findIndex(p => 
        p.moradorId === moradorId && p.contaFixaId === contaSelecionada
      )

      if (index >= 0) {
        const newPesos = [...pesos]
        newPesos[index] = { ...newPesos[index], peso: novoPeso }
        return newPesos
      }

      return [
        ...pesos,
        {
          moradorId,
          contaFixaId: contaSelecionada,
          peso: novoPeso
        }
      ]
    })
  }

  const handleSalvar = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/republica/contas-fixas/${contaSelecionada}/pesos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesos })
      })

      if (!response.ok) throw new Error('Erro ao salvar pesos')

      toast({
        title: 'Pesos salvos com sucesso!',
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

  const getPesoMorador = (moradorId: string) => {
    return pesos.find(p => 
      p.moradorId === moradorId && p.contaFixaId === contaSelecionada
    )?.peso || 1
  }

  const contaAtual = contasFixas.find(c => c.id === contaSelecionada)

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Pesos por Conta Fixa</Heading>

        {isInitialLoading ? (
          <Card>
            <CardBody>
              <Text textAlign="center">Carregando...</Text>
            </CardBody>
          </Card>
        ) : moradores.length === 0 ? (
          <Card>
            <CardBody>
              <Text textAlign="center">Nenhum morador encontrado.</Text>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel>Selecione a Conta</FormLabel>
                  <Select
                    value={contaSelecionada}
                    onChange={(e) => setContaSelecionada(e.target.value)}
                  >
                    {contasFixas.map(conta => (
                      <option key={conta.id} value={conta.id}>
                        {conta.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {contaAtual && (
                  <>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Morador</Th>
                          <Th>Peso</Th>
                          <Th>Porcentagem</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {moradores.map(morador => {
                          const peso = getPesoMorador(morador.id)
                          const somaPesos = moradores.reduce(
                            (acc, m) => acc + getPesoMorador(m.id),
                            0
                          )
                          const porcentagem = (peso / somaPesos) * 100

                          return (
                            <Tr key={morador.id}>
                              <Td>{morador.nome}</Td>
                              <Td>
                                <NumberInput
                                  value={peso}
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  onChange={(_, value) => handlePesoChange(morador.id, value)}
                                >
                                  <NumberInputField />
                                </NumberInput>
                              </Td>
                              <Td>{porcentagem.toFixed(1)}%</Td>
                            </Tr>
                          )
                        })}
                      </Tbody>
                    </Table>

                    <Button
                      colorScheme="blue"
                      onClick={handleSalvar}
                      isLoading={isLoading}
                      width="full"
                    >
                      Salvar Pesos
                    </Button>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
} 