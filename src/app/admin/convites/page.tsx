'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Card,
  CardBody,
  Badge,
  Text,
  TableContainer
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { ConviteMorador } from '@/app/dashboard/components/ConviteMorador'

type Convite = {
  id: string
  email: string
  status: string
  createdAt: string
  expiresAt: string
}

export default function ConvitesPage() {
  const [convites, setConvites] = useState<Convite[]>([])
  const { isAdmin } = useApp()
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página',
        status: 'error',
        duration: 3000
      })
      router.push('/dashboard')
      return
    }

    fetchConvites()
  }, [isAdmin, router, toast])

  const fetchConvites = async () => {
    try {
      const response = await fetch('/api/republica/convites')
      const data = await response.json()
      if (Array.isArray(data)) {
        setConvites(data)
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar convites',
        status: 'error'
      })
    }
  }

  const handleCancelarConvite = async (id: string) => {
    try {
      const response = await fetch(`/api/republica/convites/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar convite')
      }

      toast({
        title: 'Convite cancelado com sucesso!',
        status: 'success'
      })

      fetchConvites()
    } catch (error) {
      toast({
        title: 'Erro ao cancelar convite',
        status: 'error'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDENTE: 'yellow',
      ACEITO: 'green',
      EXPIRADO: 'red',
      CANCELADO: 'gray'
    }
    return <Badge colorScheme={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Gerenciar Convites</Heading>
          <ConviteMorador />
        </Box>

        <Card>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Data de Criação</Th>
                    <Th>Expira em</Th>
                    <Th>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {convites.map(convite => (
                    <Tr key={convite.id}>
                      <Td>{convite.email}</Td>
                      <Td>{getStatusBadge(convite.status)}</Td>
                      <Td>{new Date(convite.createdAt).toLocaleDateString()}</Td>
                      <Td>{new Date(convite.expiresAt).toLocaleDateString()}</Td>
                      <Td>
                        {convite.status === 'PENDENTE' && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleCancelarConvite(convite.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {convites.length === 0 && (
              <Text textAlign="center" color="gray.500" mt={4}>
                Nenhum convite encontrado
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 