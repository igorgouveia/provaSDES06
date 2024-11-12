import { z } from 'zod'

export const itemCompraSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  quantidade: z.number().int().positive('Quantidade deve ser positiva'),
  unidadeMedida: z.string().optional(),
  urgencia: z.enum(['BAIXA', 'MEDIA', 'ALTA']).default('BAIXA'),
  observacoes: z.string().optional(),
  moradorId: z.string()
})

export type ItemCompraData = z.infer<typeof itemCompraSchema> 