'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Select,
} from '@chakra-ui/react'
import { useApp } from '@/contexts/AppContext'

type Transacao = {
  id: string
  valor: number
  data: string
  descricao?: string
  status: string
  pagador: {
    nome: string
    apelido: string
  }
  recebedor: {
    nome: string
    apelido: string
  }
}

export function TransacaoLista() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [filtros, setFiltros] = useState({
    dataInicial: '',
    dataFinal: '',
    pagadorId: '',
    recebedorId: ''
  })
  const { state } = useApp()

  const fetchTransacoes = async () => {
    const params = new URLSearchParams()
    if (filtros.dataInicial) params.append('dataInicial', filtros.dataInicial)
    if (filtros.dataFinal) params.append('dataFinal', filtros.dataFinal)
    if (filtros.pagadorId) params.append('pagadorId', filtros.pagadorId)
    if (filtros.recebedorId) params.append('recebedorId', filtros.recebedorId)

    const response = await fetch(`/api/transacoes?${params}`)
    const data = await response.json()
    if (Array.isArray(data)) {
      setTransacoes(data)
    }
  }

  useEffect(() => {
    fetchTransacoes()
  }, [])

  const handleFilter = () => {
    fetchTransacoes()
  }

  const totalTransacionado = transacoes.reduce((acc, t) => acc + t.valor, 0)

  return (
    <Box>
      <Stack spacing={4} mb={6}>
        <Text fontSize="lg" fontWeight="bold">
          Filtros
        </Text>
        <Stack direction={['column', 'row']} spacing={4}>
          <FormControl>
            <FormLabel>Data Inicial</FormLabel>
            <Input
              type="date"
              value={filtros.dataInicial}
              onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Data Final</FormLabel>
            <Input
              type="date"
              value={filtros.dataFinal}
              onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Pagador</FormLabel>
            <Select
              value={filtros.pagadorId}
              onChange={e => setFiltros({ ...filtros, pagadorId: e.target.value })}
            >
              <option value="">Todos</option>
              {state.moradores.map(morador => (
                <option key={morador.id} value={morador.id}>
                  {morador.nome} ({morador.apelido})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Recebedor</FormLabel>
            <Select
              value={filtros.recebedorId}
              onChange={e => setFiltros({ ...filtros, recebedorId: e.target.value })}
            >
              <option value="">Todos</option>
              {state.moradores.map(morador => (
                <option key={morador.id} value={morador.id}>
                  {morador.nome} ({morador.apelido})
                </option>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Button colorScheme="blue" onClick={handleFilter}>
          Aplicar Filtros
        </Button>
      </Stack>

      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Total transacionado: R$ {totalTransacionado.toFixed(2)}
      </Text>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Data</Th>
              <Th>Pagador</Th>
              <Th>Recebedor</Th>
              <Th isNumeric>Valor</Th>
              <Th>Descrição</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transacoes.map(transacao => (
              <Tr key={transacao.id}>
                <Td>{new Date(transacao.data).toLocaleDateString()}</Td>
                <Td>{transacao.pagador.nome} ({transacao.pagador.apelido})</Td>
                <Td>{transacao.recebedor.nome} ({transacao.recebedor.apelido})</Td>
                <Td isNumeric>R$ {transacao.valor.toFixed(2)}</Td>
                <Td>{transacao.descricao || '-'}</Td>
                <Td>{transacao.status}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {transacoes.length === 0 && (
        <Text textAlign="center" color="gray.500" mt={4}>
          Nenhuma transação encontrada
        </Text>
      )}
    </Box>
  )
} 