import { z } from 'zod'
import { parseDate } from '@/lib/utils/date'

export const despesaSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  valor: z.number().min(0.01, 'Valor deve ser maior que 0'),
  data: z.union([z.string(), z.date()]).transform(parseDate),
  responsavelId: z.string().min(1, 'Responsável é obrigatório'),
  descricao: z.string().optional()
})

export type DespesaData = z.infer<typeof despesaSchema> 