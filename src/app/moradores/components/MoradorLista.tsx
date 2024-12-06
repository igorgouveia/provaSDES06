'use client'

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  HStack,
  Box,
  Text,
  Badge,
  Spinner
} from '@chakra-ui/react'

type Morador = {
  id: string
  nome: string
  apelido: string
  cpf: string
  dataNascimento: string
  quarto: string
  chavePix?: string
  banco?: string
  ativo?: boolean
  email?: string
}

type MoradorListaProps = {
  moradores: Morador[]
  isLoading?: boolean
  onEdit?: (morador: Morador) => void
  onDelete?: (morador: Morador) => void
  onToggleStatus?: (morador: Morador) => void
}

export function MoradorLista({ 
  moradores = [], 
  isLoading = false,
  onEdit, 
  onDelete,
  onToggleStatus
}: MoradorListaProps) {
  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner />
      </Box>
    )
  }

  if (moradores.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">
          Nenhum morador cadastrado
        </Text>
      </Box>
    )
  }

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Apelido</Th>
            <Th>CPF</Th>
            <Th>Quarto</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {moradores.map(morador => (
            <Tr key={morador.id} opacity={morador.ativo === false ? 0.5 : 1}>
              <Td>{morador.nome}</Td>
              <Td>{morador.apelido || '-'}</Td>
              <Td>{morador.cpf || '-'}</Td>
              <Td>{morador.quarto}</Td>
              <Td>
                <Badge colorScheme={morador.ativo === false ? 'red' : 'green'}>
                  {morador.ativo === false ? 'Inativo' : 'Ativo'}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  {onEdit && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => onEdit(morador)}
                    >
                      Editar
                    </Button>
                  )}
                  {onToggleStatus && (
                    <Button
                      size="sm"
                      colorScheme={morador.ativo === false ? 'green' : 'orange'}
                      onClick={() => onToggleStatus(morador)}
                    >
                      {morador.ativo === false ? 'Ativar' : 'Desativar'}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => onDelete(morador)}
                    >
                      Remover
                    </Button>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
} 