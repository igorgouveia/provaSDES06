'use client'

import { useState, useEffect } from 'react'
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Textarea,
  VStack,
  useToast,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Stack,
  Box
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useApp } from '@/contexts/AppContext'

type DespesaFormProps = {
  onSuccess: () => void
  despesa?: any
}

export function DespesaForm({ onSuccess, despesa }: DespesaFormProps) {
  const { data: session } = useSession()
  const { state } = useApp()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tipoRateio, setTipoRateio] = useState(despesa?.tipoRateio || 'REPUBLICA')
  const [incluiResponsavel, setIncluiResponsavel] = useState(despesa?.incluiResponsavel ?? true)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      tipo: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      tipoRateio: 'REPUBLICA',
      incluiResponsavel: true,
      participantes: [],
      mes: new Date().toISOString().slice(0, 7)
    }
  })

  useEffect(() => {
    if (despesa) {
      setValue('tipo', despesa.tipo)
      setValue('valor', despesa.valor)
      setValue('data', new Date(despesa.data).toISOString().split('T')[0])
      setValue('descricao', despesa.descricao || '')
      setValue('tipoRateio', despesa.tipoRateio)
      setTipoRateio(despesa.tipoRateio)
      setValue('incluiResponsavel', despesa.incluiResponsavel)
      setIncluiResponsavel(despesa.incluiResponsavel)
      setValue('participantes', despesa.participantes?.map((p: any) => p.moradorId) || [])
      setValue('mes', despesa.mesReferencia || new Date().toISOString().slice(0, 7))
    }
  }, [despesa, setValue])

  const onSubmit = async (data: any) => {
    if (!session?.user?.email) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        status: 'error'
      })
      return
    }

    if (data.tipoRateio === 'ESPECIFICO' && (!data.participantes || data.participantes.length === 0)) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos um participante',
        status: 'error'
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/republica/despesas${despesa ? `/${despesa.id}` : ''}`, {
        method: despesa ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          valor: Number(data.valor)
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar despesa')
      }

      toast({
        title: `Despesa ${despesa ? 'atualizada' : 'cadastrada'} com sucesso`,
        status: 'success'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar despesa',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.tipo}>
          <FormLabel>Tipo</FormLabel>
          <Select {...register('tipo', { required: 'Campo obrigatório' })}>
            <option value="">Selecione...</option>
            <option value="MERCADO">Mercado</option>
            <option value="SERVICO">Serviço</option>
            <option value="EMPRESTIMO">Empréstimo</option>
            <option value="OUTROS">Outros</option>
          </Select>
          <FormErrorMessage>
            {errors.tipo?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.valor}>
          <FormLabel>Valor</FormLabel>
          <NumberInput min={0}>
            <NumberInputField
              {...register('valor', { 
                required: 'Campo obrigatório',
                min: { value: 0, message: 'O valor deve ser maior que 0' }
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormErrorMessage>
            {errors.valor?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.data}>
          <FormLabel>Data</FormLabel>
          <Input
            type="date"
            {...register('data', { required: 'Campo obrigatório' })}
          />
          <FormErrorMessage>
            {errors.data?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.mes}>
          <FormLabel>Mês de Referência</FormLabel>
          <Input
            type="month"
            {...register('mes', { required: 'Campo obrigatório' })}
          />
          <FormErrorMessage>
            {errors.mes?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Descrição</FormLabel>
          <Textarea {...register('descricao')} />
        </FormControl>

        <FormControl isInvalid={!!errors.tipoRateio}>
          <FormLabel>Tipo de Rateio</FormLabel>
          <Select 
            {...register('tipoRateio', { 
              required: 'Campo obrigatório',
              onChange: (e) => setTipoRateio(e.target.value)
            })}
          >
            <option value="REPUBLICA">Dividir com toda república</option>
            <option value="ESPECIFICO">Dividir com moradores específicos</option>
          </Select>
          <FormErrorMessage>
            {errors.tipoRateio?.message?.toString()}
          </FormErrorMessage>
        </FormControl>

        {tipoRateio === 'ESPECIFICO' && (
          <Box w="100%">
            <FormControl mb={4}>
              <Checkbox 
                isChecked={incluiResponsavel}
                onChange={(e) => {
                  setIncluiResponsavel(e.target.checked)
                  setValue('incluiResponsavel', e.target.checked)
                }}
              >
                Incluir responsável no rateio
              </Checkbox>
            </FormControl>

            <FormControl isInvalid={!!errors.participantes}>
              <FormLabel>Participantes</FormLabel>
              <Stack spacing={2} maxH="200px" overflowY="auto" p={2} border="1px solid" borderColor="gray.200" borderRadius="md">
                {state.moradores?.map((morador: any) => (
                  <Checkbox
                    key={morador.id}
                    value={morador.id}
                    {...register('participantes')}
                  >
                    {morador.nome}
                  </Checkbox>
                ))}
              </Stack>
              <FormErrorMessage>
                {errors.participantes?.message?.toString()}
              </FormErrorMessage>
            </FormControl>
          </Box>
        )}

        <Button
          colorScheme="blue"
          type="submit"
          width="full"
          isLoading={isLoading}
        >
          {despesa ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </VStack>
    </form>
  )
} 