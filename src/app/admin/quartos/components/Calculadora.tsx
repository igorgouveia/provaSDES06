'use client'

import {
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Text,
  Divider,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type QuartoCalculo = {
  nome?: string
  metragem: number
  numMoradores: number
  valorCalculado: number
}

export function Calculadora() {
  const [valorTotal, setValorTotal] = useState(0)
  const [metragemTotal, setMetragemTotal] = useState(0)
  const [quartos, setQuartos] = useState<QuartoCalculo[]>([])
  const [metragemUsada, setMetragemUsada] = useState(0)

  const calcularValores = () => {
    if (quartos.length === 0) return

    const totalMoradores = quartos.reduce((acc, q) => acc + q.numMoradores, 0)
    const metragemQuartos = quartos.reduce((acc, q) => acc + q.metragem, 0)
    setMetragemUsada(metragemQuartos)

    // 70% do valor é dividido por morador
    const valorPorMorador = (valorTotal * 0.7) / totalMoradores
    
    // 30% do valor é dividido por m²
    const valorPorMetroQuadrado = (valorTotal * 0.3) / metragemTotal

    const quartosCalculados = quartos.map(quarto => ({
      ...quarto,
      valorCalculado: (
        (quarto.metragem * valorPorMetroQuadrado) + 
        (valorPorMorador * quarto.numMoradores)
      )
    }))

    setQuartos(quartosCalculados)
  }

  useEffect(() => {
    calcularValores()
  }, [valorTotal, metragemTotal])

  const addQuarto = () => {
    setQuartos([...quartos, { metragem: 0, numMoradores: 1, valorCalculado: 0 }])
  }

  return (
    <VStack spacing={4}>
      <Text fontSize="xl" fontWeight="bold">
        Calculadora de Valores
      </Text>

      <FormControl>
        <FormLabel>Valor Total do Aluguel</FormLabel>
        <NumberInput
          value={valorTotal}
          onChange={(_, value) => setValorTotal(value)}
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Metragem Total do Imóvel (m²)</FormLabel>
        <NumberInput
          value={metragemTotal}
          onChange={(_, value) => setMetragemTotal(value)}
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>

      {metragemTotal > 0 && (
        <Alert status={metragemUsada <= metragemTotal ? 'info' : 'warning'}>
          <AlertIcon />
          {metragemUsada <= metragemTotal ? (
            `Metragem disponível: ${(metragemTotal - metragemUsada).toFixed(2)}m²`
          ) : (
            `Excesso de metragem: ${(metragemUsada - metragemTotal).toFixed(2)}m²`
          )}
        </Alert>
      )}

      <Divider />

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Quarto</Th>
            <Th isNumeric>m²</Th>
            <Th isNumeric>Moradores</Th>
            <Th isNumeric>Valor</Th>
          </Tr>
        </Thead>
        <Tbody>
          {quartos.map((quarto, index) => (
            <Tr key={index}>
              <Td>
                <Input
                  size="sm"
                  value={quarto.nome || `Quarto ${index + 1}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newQuartos = [...quartos]
                    newQuartos[index].nome = e.target.value
                    setQuartos(newQuartos)
                  }}
                />
              </Td>
              <Td>
                <NumberInput
                  size="sm"
                  value={quarto.metragem}
                  onChange={(_, value) => {
                    const newQuartos = [...quartos]
                    newQuartos[index].metragem = value
                    setQuartos(newQuartos)
                    calcularValores()
                  }}
                >
                  <NumberInputField />
                </NumberInput>
              </Td>
              <Td>
                <NumberInput
                  size="sm"
                  min={1}
                  value={quarto.numMoradores}
                  onChange={(_, value) => {
                    const newQuartos = [...quartos]
                    newQuartos[index].numMoradores = value
                    setQuartos(newQuartos)
                    calcularValores()
                  }}
                >
                  <NumberInputField />
                </NumberInput>
              </Td>
              <Td isNumeric>
                R$ {quarto.valorCalculado.toFixed(2)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Button onClick={addQuarto} colorScheme="blue" size="sm">
        Adicionar Quarto
      </Button>

      <Divider />

      <Box w="full">
        <Text fontWeight="bold" mb={2}>
          Distribuição do Valor:
        </Text>
        <Text>
          Valor por m²: R$ {((valorTotal * 0.3) / metragemTotal).toFixed(2)}
        </Text>
        <Text>
          Valor por Morador: R$ {((valorTotal * 0.7) / quartos.reduce((acc, q) => acc + q.numMoradores, 0)).toFixed(2)}
        </Text>
        <Text fontWeight="bold" mt={2}>
          Total Calculado: R$ {quartos.reduce((acc, q) => acc + q.valorCalculado, 0).toFixed(2)}
        </Text>
      </Box>
    </VStack>
  )
} 