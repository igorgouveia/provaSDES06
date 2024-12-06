'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Box,
  Badge,
  IconButton,
  HStack,
  useToast
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useSession } from 'next-auth/react'

type Despesa = {
  id: string
  tipo: string
  valor: number
  data: string
  descricao?: string
  responsavel: {
    nome: string
    email: string
  }
}

type DespesaListaProps = {
  despesas: Despesa[]
  totalGasto: number
  onEdit?: (despesa: Despesa) => void
  onDelete?: (despesa: Despesa) => void
}

export function DespesaLista({ 
  despesas = [], 
  totalGasto,
  onEdit,
  onDelete
}: DespesaListaProps) {
  const { data: session } = useSession()
  const toast = useToast()

  const handleDelete = async (despesa: Despesa) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      return
    }

    try {
      const response = await fetch(`/api/republica/despesas/${despesa.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir despesa')

      toast({
        title: 'Despesa excluída com sucesso',
        status: 'success'
      })

      if (onDelete) onDelete(despesa)
    } catch (error) {
      toast({
        title: 'Erro ao excluir despesa',
        status: 'error'
      })
    }
  }

  if (despesas.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">
          Nenhuma despesa cadastrada
        </Text>
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Data</Th>
            <Th>Tipo</Th>
            <Th>Descrição</Th>
            <Th>Responsável</Th>
            <Th isNumeric>Valor</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {despesas.map(despesa => {
            const isResponsavel = session?.user?.email === despesa.responsavel.email
            
            return (
              <Tr key={despesa.id}>
                <Td>{format(new Date(despesa.data), 'dd/MM/yyyy', { locale: ptBR })}</Td>
                <Td>
                  <Badge colorScheme={despesa.tipo === 'FIXA' ? 'blue' : 'green'}>
                    {despesa.tipo}
                  </Badge>
                </Td>
                <Td>{despesa.descricao || '-'}</Td>
                <Td>{despesa.responsavel.nome}</Td>
                <Td isNumeric>R$ {despesa.valor.toFixed(2)}</Td>
                <Td>
                  {isResponsavel && (
                    <HStack spacing={2}>
                      {onEdit && (
                        <IconButton
                          aria-label="Editar despesa"
                          icon={<FiEdit2 />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onEdit(despesa)}
                        />
                      )}
                      <IconButton
                        aria-label="Excluir despesa"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(despesa)}
                      />
                    </HStack>
                  )}
                </Td>
              </Tr>
            )
          })}
          <Tr fontWeight="bold">
            <Td colSpan={4}>Total</Td>
            <Td isNumeric>R$ {totalGasto.toFixed(2)}</Td>
            <Td></Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  )
} 