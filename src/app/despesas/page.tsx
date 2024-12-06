'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { DespesaForm } from './components/DespesaForm'
import { DespesaLista } from './components/DespesaLista'
import { DespesaFiltros } from './components/DespesaFiltros'
import { DespesaChart } from './components/DespesaChart'
import { useApp } from '@/contexts/AppContext'
import { useExportToCSV } from '@/lib/utils/exportToCSV'

export default function DespesasPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state, refreshDespesas, refreshMoradores } = useApp()
  const exportToCSV = useExportToCSV()
  const [selectedDespesa, setSelectedDespesa] = useState<any>(null)
  const toast = useToast()

  useEffect(() => {
    refreshMoradores()
    refreshDespesas()
  }, [refreshMoradores, refreshDespesas])

  const handleExportCSV = () => {
    if (Array.isArray(state.despesas) && state.despesas.length > 0) {
      exportToCSV(state.despesas, 'despesas')
    }
  }

  const totalGasto = Array.isArray(state.despesas) 
    ? state.despesas.reduce((acc, despesa) => acc + despesa.valor, 0)
    : 0

  const handleFilter = async (filtros: any) => {
    const params = new URLSearchParams()
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    if (filtros.dataInicial) params.append('dataInicial', filtros.dataInicial)
    if (filtros.dataFinal) params.append('dataFinal', filtros.dataFinal)

    const response = await fetch(`/api/republica/despesas?${params}`)
    const data = await response.json()
    if (Array.isArray(data)) {
      // Use o dispatch aqui para atualizar o estado
      // dispatch({ type: 'SET_DESPESAS', payload: data })
    }
  }

  const handleEdit = (despesa: any) => {
    setSelectedDespesa(despesa)
    onOpen()
  }

  const handleDelete = async () => {
    await refreshDespesas()
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8} display="flex" justifyContent="space-between" alignItems="center">
        <Heading size="lg">Despesas</Heading>
        <Button colorScheme="blue" onClick={() => {
          setSelectedDespesa(null)
          onOpen()
        }}>
          Nova Despesa
        </Button>
      </Box>

      <VStack spacing={8} align="stretch">
        <DespesaFiltros onFilter={handleFilter} />

        <Box display="flex" gap={8}>
          <Box flex={1}>
            <DespesaLista
              despesas={state.despesas || []}
              totalGasto={totalGasto}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
          <Box flex={1}>
            <DespesaChart despesas={state.despesas || []} />
          </Box>
        </Box>

        <Button onClick={handleExportCSV} colorScheme="green">
          Exportar para CSV
        </Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedDespesa ? 'Editar Despesa' : 'Nova Despesa'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <DespesaForm 
              despesa={selectedDespesa}
              onSuccess={() => {
                onClose()
                refreshDespesas()
              }} 
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
} 