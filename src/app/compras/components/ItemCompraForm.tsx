'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea,
  useToast,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'
import { itemCompraSchema, type ItemCompraData } from '@/lib/validations/itemCompra'
import { useApp } from '@/contexts/AppContext'

type ItemCompraFormProps = {
  onSuccess?: () => void
}

export function ItemCompraForm({ onSuccess }: ItemCompraFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { state } = useApp()
  
  const { register, handleSubmit, formState: { errors } } = useForm<ItemCompraData>({
    resolver: zodResolver(itemCompraSchema)
  })

  const onSubmit = async (data: ItemCompraData) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao adicionar item')
      }

      toast({
        title: 'Item adicionado com sucesso!',
        status: 'success'
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro ao adicionar item',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.nome}>
          <FormLabel>Nome do Item</FormLabel>
          <Input {...register('nome')} />
          <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.quantidade}>
          <FormLabel>Quantidade</FormLabel>
          <NumberInput min={1}>
            <NumberInputField {...register('quantidade', { valueAsNumber: true })} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>{errors.quantidade?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Unidade de Medida</FormLabel>
          <Select {...register('unidadeMedida')}>
            <option value="">Selecione</option>
            <option value="kg">Quilogramas (kg)</option>
            <option value="g">Gramas (g)</option>
            <option value="l">Litros (l)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="un">Unidades (un)</option>
          </Select>
        </FormControl>

        <FormControl isInvalid={!!errors.urgencia}>
          <FormLabel>Urgência</FormLabel>
          <Select {...register('urgencia')}>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </Select>
          <FormErrorMessage>{errors.urgencia?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Observações</FormLabel>
          <Textarea {...register('observacoes')} />
        </FormControl>

        <FormControl isInvalid={!!errors.moradorId}>
          <FormLabel>Adicionado por</FormLabel>
          <Select {...register('moradorId')}>
            <option value="">Selecione o morador</option>
            {state.moradores.map(morador => (
              <option key={morador.id} value={morador.id}>
                {morador.nome} ({morador.apelido})
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.moradorId?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
        >
          Adicionar Item
        </Button>
      </Stack>
    </Box>
  )
} 