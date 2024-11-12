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
  Badge,
  Checkbox,
  useToast
} from '@chakra-ui/react'

type ItemCompra = {
  id: string
  nome: string
  quantidade: number
  unidadeMedida?: string
  urgencia: string
  observacoes?: string
  status: string
  adicionadoPor: {
    nome: string
    apelido: string
  }
}

export function ItemCompraLista() {
  const [itens, setItens] = useState<ItemCompra[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const toast = useToast()

  const fetchItens = async () => {
    const response = await fetch('/api/compras')
    const data = await response.json()
    if (Array.isArray(data)) {
      setItens(data)
    }
  }

  useEffect(() => {
    fetchItens()
  }, [])

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleMarkAsComprado = async () => {
    try {
      const response = await fetch('/api/compras/marcar-comprados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedItems })
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar itens como comprados')
      }

      toast({
        title: 'Itens marcados como comprados',
        status: 'success'
      })

      fetchItens()
      setSelectedItems([])
    } catch (error) {
      toast({
        title: 'Erro ao marcar itens',
        status: 'error'
      })
    }
  }

  const getUrgenciaBadge = (urgencia: string) => {
    const colors = {
      ALTA: 'red',
      MEDIA: 'yellow',
      BAIXA: 'green'
    }
    return <Badge colorScheme={colors[urgencia as keyof typeof colors]}>{urgencia}</Badge>
  }

  return (
    <Box>
      {selectedItems.length > 0 && (
        <Stack direction="row" mb={4}>
          <Button colorScheme="green" onClick={handleMarkAsComprado}>
            Marcar {selectedItems.length} item(s) como comprado(s)
          </Button>
        </Stack>
      )}

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th width="40px"></Th>
              <Th>Item</Th>
              <Th>Quantidade</Th>
              <Th>Urgência</Th>
              <Th>Adicionado por</Th>
              <Th>Observações</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {itens.map(item => (
              <Tr key={item.id}>
                <Td>
                  <Checkbox
                    isChecked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                  />
                </Td>
                <Td>{item.nome}</Td>
                <Td>
                  {item.quantidade} {item.unidadeMedida || 'un'}
                </Td>
                <Td>{getUrgenciaBadge(item.urgencia)}</Td>
                <Td>
                  {item.adicionadoPor.nome} ({item.adicionadoPor.apelido})
                </Td>
                <Td>{item.observacoes || '-'}</Td>
                <Td>{item.status}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {itens.length === 0 && (
        <Text textAlign="center" color="gray.500" mt={4}>
          Nenhum item na lista de compras
        </Text>
      )}
    </Box>
  )
} 