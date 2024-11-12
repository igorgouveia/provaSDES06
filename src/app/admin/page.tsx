'use client'

import { useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  useToast
} from '@chakra-ui/react'
import { useApp } from '@/contexts/AppContext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const { state, refreshMoradores, refreshDespesas, isAdmin } = useApp()
  const { data: session } = useSession()
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

    refreshMoradores()
    refreshDespesas()
  }, [isAdmin, router, toast, refreshMoradores, refreshDespesas])

  const totalDespesas = Array.isArray(state.despesas)
    ? state.despesas.reduce((acc, despesa) => acc + despesa.valor, 0)
    : 0

  const totalMoradores = Array.isArray(state.moradores)
    ? state.moradores.length
    : 0

  const mediaPorMorador = totalMoradores > 0
    ? totalDespesas / totalMoradores
    : 0

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Painel Administrativo</Heading>
          <Text color="gray.600">
            Bem-vindo ao painel administrativo da república
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total de Moradores</StatLabel>
                <StatNumber>{totalMoradores}</StatNumber>
                <StatHelpText>Ativos</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total de Despesas</StatLabel>
                <StatNumber>R$ {totalDespesas.toFixed(2)}</StatNumber>
                <StatHelpText>Mês Atual</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Média por Morador</StatLabel>
                <StatNumber>R$ {mediaPorMorador.toFixed(2)}</StatNumber>
                <StatHelpText>Sem considerar peso</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Ações Rápidas</Heading>
                <Button colorScheme="blue" onClick={() => router.push('/moradores')}>
                  Gerenciar Moradores
                </Button>
                <Button colorScheme="blue" onClick={() => router.push('/despesas')}>
                  Gerenciar Despesas
                </Button>
                <Button colorScheme="blue" onClick={() => router.push('/transacoes')}>
                  Ver Transações
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Configurações</Heading>
                <Button colorScheme="blue" onClick={() => router.push('/admin/configuracoes')}>
                  Configurações da República
                </Button>
                <Button colorScheme="blue" onClick={() => router.push('/admin/convites')}>
                  Gerenciar Convites
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  )
} 