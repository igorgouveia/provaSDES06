'use client'

import { useState } from 'react'
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button
} from '@chakra-ui/react'

type Filtros = {
  tipo?: string
  dataInicial?: string
  dataFinal?: string
}

type DespesaFiltrosProps = {
  onFilter: (filtros: Filtros) => void
}

export function DespesaFiltros({ onFilter }: DespesaFiltrosProps) {
  const [filtros, setFiltros] = useState<Filtros>({})

  const handleFilter = () => {
    onFilter(filtros)
  }

  return (
    <Box p={4} bg="gray.50" borderRadius="md">
      <Stack direction={['column', 'row']} spacing={4}>
        <FormControl>
          <FormLabel>Tipo</FormLabel>
          <Select
            onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
            placeholder="Todos"
          >
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
        </FormControl>

        <FormControl>
          <FormLabel>Data Inicial</FormLabel>
          <Input
            type="date"
            onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Data Final</FormLabel>
          <Input
            type="date"
            onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          />
        </FormControl>

        <Button
          alignSelf="flex-end"
          colorScheme="blue"
          onClick={handleFilter}
        >
          Aplicar Filtros
        </Button>
      </Stack>
    </Box>
  )
} 