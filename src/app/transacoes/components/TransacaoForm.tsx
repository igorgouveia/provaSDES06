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
import { transacaoSchema, type TransacaoData } from '@/lib/validations/transacao'
import { useApp } from '@/contexts/AppContext'

type TransacaoFormProps = {
  onSuccess?: () => void
}

export function TransacaoForm({ onSuccess }: TransacaoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const { state } = useApp()
  
  const { register, handleSubmit, formState: { errors } } = useForm<TransacaoData>({
    resolver: zodResolver(transacaoSchema)
  })

  const onSubmit = async (data: TransacaoData) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar transação')
      }

      toast({
        title: 'Transação criada com sucesso!',
        status: 'success'
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro ao criar transação',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl isInvalid={!!errors.pagadorId}>
          <FormLabel>Pagador</FormLabel>
          <Select {...register('pagadorId')}>
            <option value="">Selecione o pagador</option>
            {state.moradores.map(morador => (
              <option key={morador.id} value={morador.id}>
                {morador.nome} ({morador.apelido})
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.pagadorId?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.recebedorId}>
          <FormLabel>Recebedor</FormLabel>
          <Select {...register('recebedorId')}>
            <option value="">Selecione o recebedor</option>
            {state.moradores.map(morador => (
              <option key={morador.id} value={morador.id}>
                {morador.nome} ({morador.apelido})
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.recebedorId?.message}</FormErrorMessage>
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

        <FormControl>
          <FormLabel>Descrição</FormLabel>
          <Textarea {...register('descricao')} />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
        >
          Criar Transação
        </Button>
      </Stack>
    </Box>
  )
} 