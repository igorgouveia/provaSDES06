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
  FormErrorMessage
} from '@chakra-ui/react'
import { despesaSchema, type DespesaData } from '@/lib/validations/despesa'
import { useApp } from '@/contexts/AppContext'

type DespesaFormProps = {
  onSuccess?: () => void
}

export function DespesaForm({ onSuccess }: DespesaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { state, refreshDespesas } = useApp()
  
  const { register, handleSubmit, formState: { errors } } = useForm<DespesaData>({
    resolver: zodResolver(despesaSchema)
  })

  const onSubmit = async (data: DespesaData) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/despesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao cadastrar despesa')
      }

      await refreshDespesas()
      
      toast({
        title: 'Despesa cadastrada com sucesso!',
        status: 'success'
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar despesa',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.tipo}>
          <FormLabel>Tipo</FormLabel>
          <Select {...register('tipo')}>
            <option value="Aluguel">Aluguel</option>
            <option value="Água">Água</option>
            <option value="Luz">Luz</option>
            <option value="Empregada">Empregada</option>
            <option value="Caixinha">Caixinha</option>
            <option value="IPTU">IPTU</option>
            <option value="13º + 1/3">13º + 1/3</option>
            <option value="Internet">Internet</option>
            <option value="Compras">Compras</option>
          </Select>
          <FormErrorMessage>{errors.tipo?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.valor}>
          <FormLabel>Valor</FormLabel>
          <Input
            {...register('valor', { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
          <FormErrorMessage>{errors.valor?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.data}>
          <FormLabel>Data</FormLabel>
          <Input {...register('data')} type="date" />
          <FormErrorMessage>{errors.data?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.responsavelId}>
          <FormLabel>Responsável</FormLabel>
          <Select {...register('responsavelId')}>
            {state.moradores.map(morador => (
              <option key={morador.id} value={morador.id}>
                {morador.nome} ({morador.apelido})
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.responsavelId?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Descrição</FormLabel>
          <Textarea {...register('descricao')} />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
        >
          Cadastrar Despesa
        </Button>
      </Stack>
    </Box>
  )
} 