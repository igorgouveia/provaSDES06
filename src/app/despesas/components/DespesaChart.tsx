'use client'

import { Box } from '@chakra-ui/react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

type Despesa = {
  id: string
  tipo: string
  valor: number
  data: string
  descricao?: string
  responsavel: {
    nome: string
    apelido: string
  }
}

type DespesaChartProps = {
  despesas: Despesa[]
}

export function DespesaChart({ despesas }: DespesaChartProps) {
  // Garantir que despesas é sempre um array
  const despesasArray = Array.isArray(despesas) ? despesas : []

  // Cores para o gráfico
  const cores = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#36A2EB'
  ]

  // Agrupar despesas por tipo
  const despesasPorTipo = despesasArray.reduce((acc, despesa) => {
    acc[despesa.tipo] = (acc[despesa.tipo] || 0) + despesa.valor
    return acc
  }, {} as Record<string, number>)

  const data = {
    labels: Object.keys(despesasPorTipo),
    datasets: [
      {
        data: Object.values(despesasPorTipo),
        backgroundColor: cores.slice(0, Object.keys(despesasPorTipo).length),
        borderWidth: 1
      }
    ]
  }

  return (
    <Box>
      <Pie data={data} />
    </Box>
  )
} 