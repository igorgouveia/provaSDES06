'use client'

import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  useToast,
  Card,
  CardBody,
  Text,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  IconButton,
  NumberInput,
  NumberInputField,
  Badge,
  Tooltip
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons'
import { format, subMonths, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type ContaFixa = {
  id: string
  nome: string
  tipoValor: string
  vencimento: number
}

type ValorMensal = {
  id: string
  valor: number
  mes: string
  contaFixaId: string
}

type StatusMes = {
  status: 'nao_usado' | 'aberto' | 'fechado'
  dataFechamento: string | null
}

export default function FechamentoMesPage() {
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([])
  const [valoresMensais, setValoresMensais] = useState<ValorMensal[]>([])
  const [valoresAlterados, setValoresAlterados] = useState<Record<string, number>>({})
  const [statusMes, setStatusMes] = useState<StatusMes | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mes, setMes] = useState(format(new Date(), 'yyyy-MM'))
  const toast = useToast()

  useEffect(() => {
    fetchContasFixas()
    fetchValoresMensais()
    fetchStatusMes()
  }, [mes])

  const fetchContasFixas = async () => {
    try {
      const response = await fetch('/api/republica/contas-fixas')
      if (!response.ok) throw new Error('Erro ao buscar contas fixas')
      const data = await response.json()
      setContasFixas(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao buscar contas fixas',
        status: 'error'
      })
    }
  }

  const fetchValoresMensais = async () => {
    try {
      const response = await fetch(`/api/republica/contas-fixas/valores-mensais?mes=${mes}`)
      if (!response.ok) throw new Error('Erro ao buscar valores mensais')
      const data = await response.json()
      setValoresMensais(data)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao buscar valores mensais',
        status: 'error'
      })
    }
  }

  const fetchStatusMes = async () => {
    try {
      const response = await fetch(`/api/republica/fechamento/valores?mes=${mes}`)
      if (!response.ok) throw new Error('Erro ao buscar status do mês')
      const data = await response.json()
      setStatusMes(data.status)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao buscar status do mês',
        status: 'error'
      })
    }
  }

  const handleMesChange = (direcao: 'prev' | 'next') => {
    const currentDate = parseISO(mes + '-01')
    const newDate = direcao === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1)
    setMes(format(newDate, 'yyyy-MM'))
  }

  const handleValorChange = (contaFixaId: string, novoValor: number) => {
    if (statusMes?.status === 'fechado') return
    setValoresAlterados(prev => ({
      ...prev,
      [contaFixaId]: novoValor
    }))
  }

  const handleSalvarValores = async () => {
    setIsLoading(true)
    try {
      await Promise.all(
        Object.entries(valoresAlterados).map(([contaFixaId, valor]) =>
          fetch(`/api/republica/contas-fixas/${contaFixaId}/valor-mensal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              valor,
              mes
            })
          })
        )
      )

      // Recarregar valores
      await fetchValoresMensais()
      
      // Limpar alterações
      setValoresAlterados({})

      toast({
        title: 'Valores salvos com sucesso',
        status: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao salvar valores',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopiarValorAnterior = async (contaFixaId: string) => {
    try {
      const mesAnterior = format(subMonths(parseISO(mes + '-01'), 1), 'yyyy-MM')
      const response = await fetch(`/api/republica/fechamento/valores?mes=${mesAnterior}`)
      if (!response.ok) throw new Error('Erro ao buscar valores do mês anterior')
      
      const data = await response.json()
      const valorAnterior = data.valores.find(v => v.contaFixaId === contaFixaId)
      
      if (valorAnterior) {
        handleValorChange(contaFixaId, valorAnterior.valor)
      }
    } catch (error) {
      toast({
        title: 'Erro ao copiar valor',
        status: 'error'
      })
    }
  }

  const handleFecharMes = async () => {
    if (Object.keys(valoresAlterados).length > 0) {
      const confirmar = window.confirm('Existem valores não salvos. Deseja salvá-los antes de fechar o mês?')
      if (confirmar) {
        await handleSalvarValores()
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/fechamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mes: mes,
          acao: 'fechar'
        })
      })
      
      if (!response.ok) throw new Error('Erro ao fechar mês')
      
      await fetchValoresMensais()
      await fetchStatusMes()
      
      toast({
        title: 'Mês fechado com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao fechar mês',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReabrirMes = async () => {
    if (!window.confirm('Tem certeza que deseja reabrir este mês?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/fechamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mes: mes,
          acao: 'reabrir'
        })
      })
      
      if (!response.ok) throw new Error('Erro ao reabrir mês')
      
      await fetchValoresMensais()
      await fetchStatusMes()
      
      toast({
        title: 'Mês reaberto com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao reabrir mês',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIniciarMes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/fechamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mes: mes,
          acao: 'iniciar'
        })
      })
      
      if (!response.ok) throw new Error('Erro ao iniciar mês')
      
      await fetchValoresMensais()
      await fetchStatusMes()
      
      toast({
        title: 'Mês iniciado com sucesso!',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao iniciar mês',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const temAlteracoesNaoSalvas = Object.keys(valoresAlterados).length > 0

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Fechamento do Mês</Heading>
          <Badge 
            colorScheme={
              statusMes?.status === 'fechado' ? 'red' : 
              statusMes?.status === 'aberto' ? 'green' : 
              'gray'
            }
            fontSize="md"
            p={2}
          >
            {statusMes?.status === 'fechado' ? 'Fechado' : 
             statusMes?.status === 'aberto' ? 'Aberto' : 
             'Não Iniciado'}
          </Badge>
        </HStack>

        <Card>
          <CardBody>
            <VStack spacing={6}>
              {/* Seletor de Mês */}
              <HStack width="full" justify="center" spacing={4}>
                <IconButton
                  aria-label="Mês anterior"
                  icon={<ChevronLeftIcon />}
                  onClick={() => handleMesChange('prev')}
                />
                <Text fontSize="lg" fontWeight="bold">
                  {format(parseISO(mes + '-01'), 'MMMM yyyy', { locale: ptBR })}
                </Text>
                <IconButton
                  aria-label="Próximo mês"
                  icon={<ChevronRightIcon />}
                  onClick={() => handleMesChange('next')}
                />
              </HStack>

              {/* Ações */}
              <HStack width="full" justify="space-between">
                <Button
                  colorScheme="green"
                  onClick={handleSalvarValores}
                  isLoading={isLoading}
                  isDisabled={!temAlteracoesNaoSalvas || statusMes?.status === 'fechado'}
                  leftIcon={<CheckIcon />}
                >
                  Salvar Alterações
                </Button>
                {statusMes?.status === 'nao_usado' ? (
                  <Button
                    colorScheme="blue"
                    onClick={handleIniciarMes}
                    isLoading={isLoading}
                  >
                    Iniciar Mês
                  </Button>
                ) : statusMes?.status === 'fechado' ? (
                  <Button
                    colorScheme="yellow"
                    onClick={handleReabrirMes}
                    isLoading={isLoading}
                  >
                    Reabrir Mês
                  </Button>
                ) : statusMes?.status === 'aberto' ? (
                  <Button
                    colorScheme="blue"
                    onClick={handleFecharMes}
                    isLoading={isLoading}
                  >
                    Fechar Mês
                  </Button>
                ) : null}
              </HStack>

              {temAlteracoesNaoSalvas && (
                <Alert status="warning">
                  <AlertIcon />
                  Existem alterações não salvas
                </Alert>
              )}

              {/* Tabela de Contas */}
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Conta</Th>
                    <Th>Vencimento</Th>
                    <Th isNumeric>Valor</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {contasFixas.map(conta => {
                    const valorMensal = valoresMensais.find(v => v.contaFixaId === conta.id)
                    const valorAtual = valoresAlterados[conta.id] ?? valorMensal?.valor ?? 0
                    const foiAlterado = conta.id in valoresAlterados

                    return (
                      <Tr key={conta.id}>
                        <Td>{conta.nome}</Td>
                        <Td>Dia {conta.vencimento}</Td>
                        <Td isNumeric>
                          <NumberInput
                            value={valorAtual}
                            onChange={(_, value) => handleValorChange(conta.id, value)}
                            isDisabled={statusMes?.status === 'fechado'}
                            min={0}
                            precision={2}
                          >
                            <NumberInputField 
                              textAlign="right"
                              bg={foiAlterado ? 'yellow.50' : undefined}
                            />
                          </NumberInput>
                        </Td>
                        <Td>
                          <Tooltip label="Copiar valor do mês anterior">
                            <IconButton
                              aria-label="Copiar valor do mês anterior"
                              icon={<CopyIcon />}
                              size="sm"
                              onClick={() => handleCopiarValorAnterior(conta.id)}
                              isDisabled={statusMes?.status === 'fechado'}
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>

              {statusMes?.dataFechamento && (
                <Text color="gray.500">
                  Fechado em: {format(parseISO(statusMes.dataFechamento), 'dd/MM/yyyy HH:mm')}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 