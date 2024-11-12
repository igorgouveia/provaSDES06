'use client'

import {
  Box,
  useColorModeValue
} from '@chakra-ui/react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

type DespesaChartProps = {
  despesas: Array<{
    tipo: string
    valor: number
  }>
}

export function DespesaChart({ despesas }: DespesaChartProps) {
  const colors = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#a4de6c'
  ]

  // Agrupar despesas por tipo
  const despesasPorTipo = despesas.reduce((acc, despesa) => {
    acc[despesa.tipo] = (acc[despesa.tipo] || 0) + despesa.valor
    return acc
  }, {} as Record<string, number>)

  const data: ChartData<'pie'> = {
    labels: Object.keys(despesasPorTipo),
    datasets: [
      {
        data: Object.values(despesasPorTipo),
        backgroundColor: colors,
        borderColor: useColorModeValue('white', 'gray.800'),
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: useColorModeValue('black', 'white')
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            return `R$ ${value.toFixed(2)}`
          }
        }
      }
    }
  }

  return (
    <Box h="400px" w="100%">
      <Pie data={data} options={options} />
    </Box>
  )
} 