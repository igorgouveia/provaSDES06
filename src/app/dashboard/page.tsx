'use client'

import { useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
} from '@chakra-ui/react'
import { useApp } from '@/contexts/AppContext'
import { DespesaChart } from '../despesas/components/DespesaChart'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { state, refreshDespesas, refreshMoradores, isAdmin } = useApp()
  const { data: session } = useSession()

  useEffect(() => {
    refreshDespesas()
    refreshMoradores()
  }, [refreshDespesas, refreshMoradores])

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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Dashboard</Heading>
        </Box>

        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
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

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total de Moradores</StatLabel>
                <StatNumber>{totalMoradores}</StatNumber>
                <StatHelpText>Ativos</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Distribuição de Despesas</Heading>
            <Box h="400px">
              <DespesaChart despesas={state.despesas || []} />
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 