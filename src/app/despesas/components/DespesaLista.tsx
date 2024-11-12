'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  TableContainer
} from '@chakra-ui/react'

type Despesa = {
  id: string
  tipo: string
  valor: number
  data: string
  descricao?: string
  responsavel: {
    nome: string
    apelido: string
  }
}

type DespesaListaProps = {
  despesas: Despesa[]
  totalGasto: number
}

export function DespesaLista({ despesas = [], totalGasto = 0 }: DespesaListaProps) {
  const despesasArray = Array.isArray(despesas) ? despesas : []

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Total gasto no período: R$ {totalGasto.toFixed(2)}
      </Text>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Data</Th>
              <Th>Tipo</Th>
              <Th isNumeric>Valor</Th>
              <Th>Responsável</Th>
              <Th>Descrição</Th>
            </Tr>
          </Thead>
          <Tbody>
            {despesasArray.map(despesa => (
              <Tr key={despesa.id}>
                <Td>{new Date(despesa.data).toLocaleDateString()}</Td>
                <Td>{despesa.tipo}</Td>
                <Td isNumeric>R$ {despesa.valor.toFixed(2)}</Td>
                <Td>{despesa.responsavel.nome} ({despesa.responsavel.apelido})</Td>
                <Td>{despesa.descricao || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
} 