'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Card,
  CardBody,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Alert,
  AlertIcon,
  TableContainer,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { EditIcon } from '@chakra-ui/icons'
import { DespesaForm } from '../despesas/components/DespesaForm'
import { useSession } from 'next-auth/react'

type Fechamento = {
  mes: string
  aluguel: number
  contasFixas: Array<{
    nome: string
    valor: number
  }>
  despesas: Array<{
    tipo: string
    descricao?: string
    valor: number
    data: string
    responsavel: {
      nome: string
    }
  }>
  descontos: Array<{
    tipo: string
    descricao?: string
    valor: number
    data: string
    responsavel: {
      nome: string
    }
  }>
  total: number
  detalhes: {
    totalContasFixas: number
    totalDespesasRegulares: number
    totalDescontos: number
    valorAluguel: number
  }
  status: 'aberto' | 'fechado'
}

export default function MeuFechamentoPage() {
  const { data: session } = useSession()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedDespesa, setSelectedDespesa] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([])
  const [mesSelecionado, setMesSelecionado] = useState<string>('')
  const [fechamento, setFechamento] = useState<Fechamento | null>(null)

  // Buscar meses disponíveis
  useEffect(() => {
    const fetchMeses = async () => {
      try {
        const response = await fetch('/api/republica/fechamento/meses-abertos')
        if (!response.ok) throw new Error('Erro ao buscar meses')
        
        const data = await response.json()
        const mesesOrdenados = data.meses.sort((a: string, b: string) => b.localeCompare(a))
        
        setMesesDisponiveis(mesesOrdenados)
        if (mesesOrdenados.length > 0) {
          setMesSelecionado(mesesOrdenados[0])
        }
      } catch (error) {
        setError('Erro ao carregar meses disponíveis')
      }
    }

    fetchMeses()
  }, [])

  // Buscar dados do fechamento quando o mês é selecionado
  useEffect(() => {
    const fetchFechamento = async () => {
      if (!mesSelecionado) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/republica/fechamento/meu-fechamento?mes=${mesSelecionado}`)
        if (!response.ok) throw new Error('Erro ao buscar fechamento')
        
        const data = await response.json()
        setFechamento(data)
      } catch (error) {
        setError('Erro ao carregar dados do fechamento')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFechamento()
  }, [mesSelecionado])

  const handleEditDespesa = (despesa: any) => {
    setSelectedDespesa(despesa)
    onOpen()
  }

  const handleDespesaSuccess = () => {
    onClose()
    setSelectedDespesa(null)
    // Recarregar os dados do fechamento
    if (mesSelecionado) {
      fetchFechamento()
    }
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Meu Fechamento</Heading>
          <Select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            maxW="300px"
          >
            {mesesDisponiveis.map((mes) => (
              <option key={mes} value={mes}>
                {format(parseISO(mes + '-01'), 'MMMM/yyyy', { locale: ptBR })}
              </option>
            ))}
          </Select>
        </Box>

        {isLoading ? (
          <Box textAlign="center" py={8}>
            <Spinner />
          </Box>
        ) : fechamento ? (
          <>
            <StatGroup>
              <Card flex={1}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total a Pagar</StatLabel>
                    <StatNumber color="red.500">
                      R$ {(fechamento?.total || 0).toFixed(2)}
                    </StatNumber>
                    <Badge 
                      colorScheme={fechamento?.status === 'fechado' ? 'green' : 'yellow'}
                      mt={2}
                    >
                      {fechamento?.status === 'fechado' ? 'Fechado' : 'Preview'}
                    </Badge>
                  </Stat>
                </CardBody>
              </Card>
            </StatGroup>

            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Detalhamento</Heading>
                
                <VStack spacing={6} align="stretch">
                  {/* Aluguel */}
                  <Box>
                    <Heading size="sm" mb={2}>Aluguel do Quarto</Heading>
                    <Text fontSize="lg">
                      R$ {(fechamento?.aluguel || 0).toFixed(2)}
                    </Text>
                  </Box>

                  {/* Contas Fixas */}
                  <Box>
                    <Heading size="sm" mb={2}>Contas Fixas</Heading>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Conta</Th>
                            <Th isNumeric>Valor</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {fechamento?.contasFixas?.map((conta, index) => (
                            <Tr key={index}>
                              <Td>{conta.nome}</Td>
                              <Td isNumeric>R$ {(conta.valor || 0).toFixed(2)}</Td>
                            </Tr>
                          ))}
                          <Tr fontWeight="bold">
                            <Td>Total Contas Fixas</Td>
                            <Td isNumeric>R$ {(fechamento?.detalhes?.totalContasFixas || 0).toFixed(2)}</Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Despesas */}
                  <Box>
                    <Heading size="sm" mb={2}>Despesas do Mês</Heading>
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Tipo</Th>
                            <Th>Descrição</Th>
                            <Th>Data</Th>
                            <Th>Responsável</Th>
                            <Th isNumeric>Valor</Th>
                            <Th width="50px"></Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {fechamento?.despesas?.map((despesa, index) => (
                            <Tr key={index}>
                              <Td>{despesa.tipo}</Td>
                              <Td>{despesa.descricao || '-'}</Td>
                              <Td>{format(parseISO(despesa.data), 'dd/MM/yyyy')}</Td>
                              <Td>{despesa.responsavel.nome}</Td>
                              <Td isNumeric>R$ {(despesa.valor || 0).toFixed(2)}</Td>
                              <Td>
                                {despesa.responsavel.email === session?.user?.email && (
                                  <IconButton
                                    aria-label="Editar despesa"
                                    icon={<EditIcon />}
                                    size="sm"
                                    onClick={() => handleEditDespesa(despesa)}
                                  />
                                )}
                              </Td>
                            </Tr>
                          ))}
                          <Tr fontWeight="bold">
                            <Td colSpan={4}>Total Despesas</Td>
                            <Td isNumeric>R$ {(fechamento?.detalhes?.totalDespesasRegulares || 0).toFixed(2)}</Td>
                            <Td></Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Descontos */}
                  {fechamento?.descontos && fechamento.descontos.length > 0 && (
                    <Box>
                      <Heading size="sm" mb={2}>Descontos (Despesas que você é responsável)</Heading>
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Tipo</Th>
                              <Th>Descrição</Th>
                              <Th>Data</Th>
                              <Th>Responsável</Th>
                              <Th isNumeric>Valor</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {fechamento.descontos.map((desconto, index) => (
                              <Tr key={index}>
                                <Td>{desconto.tipo}</Td>
                                <Td>{desconto.descricao || '-'}</Td>
                                <Td>{format(parseISO(desconto.data), 'dd/MM/yyyy')}</Td>
                                <Td>{desconto.responsavel.nome}</Td>
                                <Td isNumeric color="green.500">- R$ {(desconto.valor || 0).toFixed(2)}</Td>
                              </Tr>
                            ))}
                            <Tr fontWeight="bold">
                              <Td colSpan={4}>Total Descontos</Td>
                              <Td isNumeric color="green.500">- R$ {(fechamento?.detalhes?.totalDescontos || 0).toFixed(2)}</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </>
        ) : (
          <Alert status="info">
            <AlertIcon />
            Selecione um mês para ver o fechamento
          </Alert>
        )}
      </VStack>

      {/* Modal de edição */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Despesa</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <DespesaForm
              despesa={selectedDespesa}
              onSuccess={handleDespesaSuccess}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 