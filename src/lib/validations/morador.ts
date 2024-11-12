import { z } from 'zod'
import { validateCPF } from '@/lib/utils/validateCPF'
import { parseDate } from '@/lib/utils/date'

export const moradorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  apelido: z.string().min(2, 'Apelido deve ter no mínimo 2 caracteres'),
  cpf: z.string().refine(validateCPF, 'CPF inválido'),
  dataNascimento: z.union([z.string(), z.date()]).transform(parseDate),
  quarto: z.string().min(1, 'Quarto é obrigatório'),
  chavePix: z.string().optional(),
  banco: z.string().optional(),
  pesoContas: z.number().min(0.1, 'Peso deve ser maior que 0').default(1)
})

export type MoradorData = z.infer<typeof moradorSchema> 