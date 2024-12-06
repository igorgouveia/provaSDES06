'use client'

import {
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  HStack
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type ConfiguracaoRepublicaFormProps = {
  initialData?: {
    metragemTotal?: number | null
    valorAluguel?: number | null
  }
  onSuccess: () => void
}

export function ConfiguracaoRepublicaForm({ initialData, onSuccess }: ConfiguracaoRepublicaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecalculando, setIsRecalculando] = useState(false)
  const [metragemTotal, setMetragemTotal] = useState<number>(initialData?.metragemTotal || 0)
  const [valorAluguel, setValorAluguel] = useState<number>(initialData?.valorAluguel || 0)
  const toast = useToast()

  useEffect(() => {
    if (initialData) {
      setMetragemTotal(initialData.metragemTotal || 0)
      setValorAluguel(initialData.valorAluguel || 0)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/republica', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metragemTotal,
          valorAluguel
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar configuração')
      }

      toast({
        title: 'Configuração salva com sucesso!',
        status: 'success'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro ao salvar configuração',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecalcularQuartos = async () => {
    setIsRecalculando(true)
    try {
      const response = await fetch('/api/republica/quartos/recalcular', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao recalcular quartos')
      }

      toast({
        title: 'Quartos recalculados com sucesso!',
        description: 'Os valores dos quartos foram atualizados.',
        status: 'success'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro ao recalcular quartos',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsRecalculando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Metragem Total (m²)</FormLabel>
          <NumberInput 
            min={0} 
            value={metragemTotal} 
            onChange={(_, value) => setMetragemTotal(value)}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Valor do Aluguel</FormLabel>
          <NumberInput 
            min={0} 
            value={valorAluguel}
            onChange={(_, value) => setValorAluguel(value)}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <VStack spacing={2} width="full">
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isLoading}
            width="full"
          >
            Salvar Configurações
          </Button>

          <Button
            colorScheme="green"
            width="full"
            onClick={handleRecalcularQuartos}
            isLoading={isRecalculando}
            isDisabled={!metragemTotal || !valorAluguel}
          >
            Recalcular Quartos
          </Button>
        </VStack>
      </VStack>
    </form>
  )
} 