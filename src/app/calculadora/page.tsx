'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  NumberInput,
  NumberInputField,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Text,
  Divider,
  Alert,
  AlertIcon,
  Tooltip
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiInfo } from 'react-icons/fi'

type Quarto = {
  numero: number
  metragem: number
  moradores: number
  valorCalculado: number
  valorPorMorador: number
  percentualArea: number
}

export default function CalculadoraPage() {
  const [valorTotal, setValorTotal] = useState(0)
  const [areaTotal, setAreaTotal] = useState(0)
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [areaComum, setAreaComum] = useState(0)

  // Calcular área comum sempre que a área total ou quartos mudarem
  useEffect(() => {
    const areaQuartos = quartos.reduce((acc, q) => acc + q.metragem, 0)
    const novaAreaComum = Math.max(0, areaTotal - areaQuartos)
    setAreaComum(novaAreaComum)
  }, [areaTotal, quartos])

  const calcularValores = () => {
    if (areaTotal === 0) {
      return
    }

    const areaQuartos = quartos.reduce((acc, q) => acc + q.metragem, 0)
    
    // Verificar se a área dos quartos não excede a área total
    if (areaQuartos > areaTotal) {
      alert('A soma das áreas dos quartos não pode exceder a área total da casa!')
      return
    }

    // Calcular área comum
    const areaComumPorPessoa = areaComum / quartos.reduce((acc, q) => acc + q.moradores, 0)

    const quartosCalculados = quartos.map(quarto => {
      // Área total do quarto (área do quarto + área comum proporcional aos moradores)
      const areaTotal = quarto.metragem + (areaComumPorPessoa * quarto.moradores)
      const percentualArea = (areaTotal / (areaTotal + areaComum)) * 100

      // Valor proporcional à área total
      const valorQuarto = (valorTotal * percentualArea) / 100
      
      return {
        ...quarto,
        valorCalculado: valorQuarto,
        valorPorMorador: valorQuarto / quarto.moradores,
        percentualArea
      }
    })

    setQuartos(quartosCalculados)
  }

  const adicionarQuarto = () => {
    setQuartos([
      ...quartos,
      {
        numero: quartos.length + 1,
        metragem: 0,
        moradores: 1,
        valorCalculado: 0,
        valorPorMorador: 0,
        percentualArea: 0
      }
    ])
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Calculadora de Aluguel</Heading>

        <Card>
          <CardBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Valor Total do Aluguel</FormLabel>
                <NumberInput
                  value={valorTotal}
                  onChange={(_, value) => setValorTotal(value)}
                  min={0}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  Área Total da Casa (m²)
                  <Tooltip label="Área total incluindo todos os cômodos">
                    <Box as="span" ml={2} cursor="help">
                      <FiInfo />
                    </Box>
                  </Tooltip>
                </FormLabel>
                <NumberInput
                  value={areaTotal}
                  onChange={(_, value) => setAreaTotal(value)}
                  min={0}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <Alert status="info">
                <AlertIcon />
                <Text>Área comum calculada: {areaComum.toFixed(2)} m²</Text>
              </Alert>

              <Divider />

              <Button onClick={adicionarQuarto}>Adicionar Quarto</Button>

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Quarto</Th>
                    <Th>Metragem (m²)</Th>
                    <Th>Moradores</Th>
                    <Th>% Área Total</Th>
                    <Th>Valor do Quarto</Th>
                    <Th>Valor por Morador</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {quartos.map((quarto, index) => (
                    <Tr key={quarto.numero}>
                      <Td>{quarto.numero}</Td>
                      <Td>
                        <NumberInput
                          value={quarto.metragem}
                          onChange={(_, value) => {
                            const newQuartos = [...quartos]
                            newQuartos[index].metragem = value
                            setQuartos(newQuartos)
                          }}
                          min={0}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </Td>
                      <Td>
                        <NumberInput
                          value={quarto.moradores}
                          onChange={(_, value) => {
                            const newQuartos = [...quartos]
                            newQuartos[index].moradores = value
                            setQuartos(newQuartos)
                          }}
                          min={1}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </Td>
                      <Td>{quarto.percentualArea.toFixed(2)}%</Td>
                      <Td>R$ {quarto.valorCalculado.toFixed(2)}</Td>
                      <Td>R$ {quarto.valorPorMorador.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <Button 
                colorScheme="blue" 
                onClick={calcularValores}
                isDisabled={quartos.length === 0 || areaTotal === 0 || valorTotal === 0}
              >
                Calcular
              </Button>

              {quartos.length > 0 && (
                <Box>
                  <Text fontWeight="bold">Resumo:</Text>
                  <Text>Área total da casa: {areaTotal} m²</Text>
                  <Text>Área comum: {areaComum.toFixed(2)} m²</Text>
                  <Text>Área dos quartos: {quartos.reduce((acc, q) => acc + q.metragem, 0)} m²</Text>
                  <Text>Total de moradores: {quartos.reduce((acc, q) => acc + q.moradores, 0)}</Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
} 