'use client'

import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  VStack
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type Cobranca = {
  id: string
  valor: number
  status: string
  mesReferencia: string
  morador: {
    nome: string
  }
}

export default function CobrancasPage() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([])

  useEffect(() => {
    fetch('/api/republica/cobrancas')
      .then(res => res.json())
      .then(data => setCobrancas(data))
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE': return 'yellow'
      case 'PAGO': return 'green'
      case 'ATRASADO': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Histórico de Cobranças</Heading>

        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Morador</Th>
                  <Th>Mês</Th>
                  <Th isNumeric>Valor</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cobrancas.map(cobranca => (
                  <Tr key={cobranca.id}>
                    <Td>{cobranca.morador.nome}</Td>
                    <Td>{cobranca.mesReferencia}</Td>
                    <Td isNumeric>R$ {cobranca.valor.toFixed(2)}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(cobranca.status)}>
                        {cobranca.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 