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
  Text
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
  pesoContas: number
  saldo?: number
}

type MoradorListaProps = {
  moradores: Morador[]
  onEdit?: (morador: Morador) => void
  onDelete?: (morador: Morador) => void
}

export function MoradorLista({ moradores = [], onEdit, onDelete }: MoradorListaProps) {
  const moradoresArray = Array.isArray(moradores) ? moradores : []

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Apelido</Th>
              <Th>CPF</Th>
              <Th>Quarto</Th>
              <Th isNumeric>Peso nas Contas</Th>
              <Th isNumeric>Saldo</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {moradoresArray.map(morador => (
              <Tr key={morador.id}>
                <Td>{morador.nome}</Td>
                <Td>{morador.apelido}</Td>
                <Td>{morador.cpf}</Td>
                <Td>{morador.quarto}</Td>
                <Td isNumeric>{morador.pesoContas}</Td>
                <Td isNumeric>
                  {morador.saldo 
                    ? `R$ ${morador.saldo.toFixed(2)}`
                    : '-'
                  }
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
      
      {moradoresArray.length === 0 && (
        <Text textAlign="center" color="gray.500" mt={4}>
          Nenhum morador cadastrado
        </Text>
      )}
    </Box>
  )
} 