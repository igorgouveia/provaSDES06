import { z } from 'zod'

export const republicaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  endereco: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  descricao: z.string().optional(),
  adminName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  adminEmail: z.string().email('Email inválido'),
  adminPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export type RepublicaData = z.infer<typeof republicaSchema> 