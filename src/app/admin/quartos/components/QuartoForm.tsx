'use client'

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  Textarea,
  useToast,
  Switch,
  FormHelperText,
  HStack
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type QuartoFormProps = {
  quarto?: {
    id: string
    nome: string
    metragem: number
    numMoradores: number
    valor?: number
    descricao?: string
  }
  valorCalculado?: number
  onSuccess: () => void
}

export function QuartoForm({ quarto, valorCalculado, onSuccess }: QuartoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [valorManual, setValorManual] = useState(!!quarto?.valor)
  const [valor, setValor] = useState(quarto?.valor || valorCalculado || 0)
  const toast = useToast()

  useEffect(() => {
    if (!valorManual && valorCalculado) {
      setValor(valorCalculado)
    }
  }, [valorCalculado, valorManual])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome'),
      metragem: Number(formData.get('metragem')),
      numMoradores: Number(formData.get('numMoradores')),
      valor: valorManual ? Number(formData.get('valor')) : valorCalculado,
      descricao: formData.get('descricao')
    }

    try {
      const url = quarto 
        ? `/api/republica/quartos/${quarto.id}`
        : '/api/republica/quartos'
      
      const response = await fetch(url, {
        method: quarto ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar quarto')
      }

      toast({
        title: 'Quarto salvo com sucesso!',
        status: 'success'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Erro ao salvar quarto',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome do Quarto</FormLabel>
          <Input 
            name="nome" 
            defaultValue={quarto?.nome} 
            placeholder="Ex: Suíte Master, Quarto 1, Quarto dos Fundos" 
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Metragem (m²)</FormLabel>
          <NumberInput min={0} defaultValue={quarto?.metragem}>
            <NumberInputField name="metragem" />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Número de Moradores</FormLabel>
          <NumberInput min={1} defaultValue={quarto?.numMoradores || 1}>
            <NumberInputField name="numMoradores" />
          </NumberInput>
        </FormControl>

        <FormControl>
          <HStack justify="space-between">
            <FormLabel mb={0}>Valor Manual</FormLabel>
            <Switch 
              isChecked={valorManual}
              onChange={(e) => setValorManual(e.target.checked)}
            />
          </HStack>
          <FormHelperText>
            {valorManual 
              ? 'Definir valor manualmente' 
              : 'Usar valor calculado automaticamente'
            }
          </FormHelperText>
        </FormControl>

        <FormControl isRequired={valorManual}>
          <FormLabel>Valor</FormLabel>
          <NumberInput
            min={0}
            value={valor}
            isDisabled={!valorManual}
            onChange={(_, value) => setValor(value)}
          >
            <NumberInputField name="valor" />
          </NumberInput>
          {!valorManual && (
            <FormHelperText>
              Valor calculado com base na metragem e número de moradores
            </FormHelperText>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Descrição</FormLabel>
          <Textarea name="descricao" defaultValue={quarto?.descricao} />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          width="full"
        >
          Salvar
        </Button>
      </VStack>
    </form>
  )
} 