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
  useToast,
  FormErrorMessage
} from '@chakra-ui/react'
import { moradorSchema, type MoradorData } from '@/lib/validations/morador'

type MoradorFormProps = {
  onSuccess?: () => void
}

type MoradorFormData = Omit<MoradorData, 'dataNascimento'> & {
  dataNascimento: string
}

export function MoradorForm({ onSuccess }: MoradorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  
  const { register, handleSubmit, formState: { errors } } = useForm<MoradorFormData>({
    resolver: zodResolver(moradorSchema.transform((data) => ({
      ...data,
      dataNascimento: data.dataNascimento instanceof Date 
        ? data.dataNascimento 
        : new Date(data.dataNascimento)
    })))
  })

  const onSubmit = async (formData: MoradorFormData) => {
    try {
      setIsLoading(true)
      
      // Converter a string de data para objeto Date
      const data: MoradorData = {
        ...formData,
        dataNascimento: new Date(formData.dataNascimento),
        pesoContas: Number(formData.pesoContas)
      }

      const response = await fetch('/api/moradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao cadastrar morador')
      }

      toast({
        title: 'Morador cadastrado com sucesso!',
        status: 'success'
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : 'Erro ao cadastrar morador',
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
          <FormLabel>Nome</FormLabel>
          <Input {...register('nome')} />
          <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.apelido}>
          <FormLabel>Apelido</FormLabel>
          <Input {...register('apelido')} />
          <FormErrorMessage>{errors.apelido?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.cpf}>
          <FormLabel>CPF</FormLabel>
          <Input {...register('cpf')} placeholder="000.000.000-00" />
          <FormErrorMessage>{errors.cpf?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.dataNascimento}>
          <FormLabel>Data de Nascimento</FormLabel>
          <Input 
            {...register('dataNascimento')} 
            type="date"
          />
          <FormErrorMessage>{errors.dataNascimento?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.quarto}>
          <FormLabel>Quarto</FormLabel>
          <Select {...register('quarto')}>
            <option value="">Selecione um quarto</option>
            <option value="Fundo">Fundo</option>
            <option value="Duplo Suíte">Duplo Suíte</option>
            <option value="Triplo Suíte 1">Triplo Suíte 1</option>
            <option value="Triplo Suíte 2">Triplo Suíte 2</option>
            <option value="Triplo Simples 1">Triplo Simples 1</option>
            <option value="Triplo Simples 2">Triplo Simples 2</option>
          </Select>
          <FormErrorMessage>{errors.quarto?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Chave Pix</FormLabel>
          <Input {...register('chavePix')} />
        </FormControl>

        <FormControl>
          <FormLabel>Banco</FormLabel>
          <Input {...register('banco')} />
        </FormControl>

        <FormControl isInvalid={!!errors.pesoContas}>
          <FormLabel>Peso nas Contas</FormLabel>
          <Input
            {...register('pesoContas')}
            type="number"
            step="0.1"
            defaultValue="1"
          />
          <FormErrorMessage>{errors.pesoContas?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
        >
          Cadastrar Morador
        </Button>
      </Stack>
    </Box>
  )
} 