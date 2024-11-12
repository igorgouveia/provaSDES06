import { z } from 'zod'
import { parseDate } from '@/lib/utils/date'

export const transacaoSchema = z.object({
  pagadorId: z.string().min(1, 'Pagador é obrigatório'),
  recebedorId: z.string().min(1, 'Recebedor é obrigatório'),
  valor: z.number().min(0.01, 'Valor deve ser maior que 0'),
  data: z.union([z.string(), z.date()]).transform(parseDate),
  descricao: z.string().optional()
})

export type TransacaoData = z.infer<typeof transacaoSchema> 