'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type MesStatus = {
  mes: string
  status: 'aberto' | 'fechado' | 'nao_usado'
  dataFechamento: string | null
}

export default function FechamentoPage() {
  const [meses, setMeses] = useState<MesStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const carregarMeses = async () => {
    try {
      // Gerar os últimos 3 meses
      const hoje = new Date()
      const mesAtual = format(hoje, 'yyyy-MM')
      const mesAnterior = format(subMonths(hoje, 1), 'yyyy-MM')
      const doisMesesAtras = format(subMonths(hoje, 2), 'yyyy-MM')
      const mesesParaVerificar = [mesAtual, mesAnterior, doisMesesAtras]

      // Buscar status de cada mês
      const statusMeses = await Promise.all(
        mesesParaVerificar.map(async (mes) => {
          const response = await fetch(`/api/republica/fechamento/valores?mes=${mes}`)
          if (!response.ok) throw new Error('Erro ao buscar status do mês')
          const data = await response.json()
          return {
            mes,
            status: data.status.status,
            dataFechamento: data.status.dataFechamento
          }
        })
      )

      setMeses(statusMeses)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao carregar meses',
        status: 'error'
      })
    }
  }

  useEffect(() => {
    carregarMeses()
  }, [])

  const handleAcao = async (mes: string, acao: 'abrir' | 'fechar') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/fechamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, acao })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar ação')
      }

      toast({
        title: `Mês ${acao === 'fechar' ? 'fechado' : 'aberto'} com sucesso`,
        status: 'success'
      })

      carregarMeses()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao processar ação',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'green'
      case 'fechado':
        return 'red'
      case 'nao_usado':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'Aberto'
      case 'fechado':
        return 'Fechado'
      case 'nao_usado':
        return 'Não Usado'
      default:
        return 'Não Usado'
    }
  }

  const getAcaoButton = (mes: string, status: string) => {
    if (status === 'nao_usado') {
      return (
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => handleAcao(mes, 'abrir')}
          isLoading={isLoading}
        >
          Iniciar Mês
        </Button>
      )
    }

    return (
      <Button
        size="sm"
        colorScheme={status === 'aberto' ? 'red' : 'green'}
        onClick={() => handleAcao(mes, status === 'aberto' ? 'fechar' : 'abrir')}
        isLoading={isLoading}
      >
        {status === 'aberto' ? 'Fechar' : 'Abrir'}
      </Button>
    )
  }

  return (
    <Box p={4}>
      <Card>
        <CardHeader>
          <Heading size="md">Fechamento de Mês</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Gerencie o fechamento dos meses da república. Um mês fechado não permite novos lançamentos de despesas.
            </Text>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Mês</Th>
                  <Th>Status</Th>
                  <Th>Data de Fechamento</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {meses.map(({ mes, status, dataFechamento }) => (
                  <Tr key={mes}>
                    <Td>
                      {format(new Date(mes + '-01'), 'MMMM/yyyy', { locale: ptBR })}
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(status)}>
                        {getStatusText(status)}
                      </Badge>
                    </Td>
                    <Td>
                      {dataFechamento
                        ? format(new Date(dataFechamento), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR
                          })
                        : '-'}
                    </Td>
                    <Td>
                      {getAcaoButton(mes, status)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
} 