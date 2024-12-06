import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const republicaSchema = z.object({
  nome: z.string(),
  endereco: z.string(),
  descricao: z.string().optional(),
  adminName: z.string(),
  adminEmail: z.string().email(),
  adminPassword: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = republicaSchema.parse(body)

    // Criar a república
    const republica = await prisma.republica.create({
      data: {
        nome: data.nome,
        endereco: data.endereco,
        descricao: data.descricao
      }
    })

    // Criar o morador admin
    const morador = await prisma.morador.create({
      data: {
        nome: data.adminName,
        republicaId: republica.id,
        ativo: true
      }
    })

    // Criar o usuário admin
    const hashedPassword = await hash(data.adminPassword, 10)
    const user = await prisma.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        moradorId: morador.id,
        republicaId: republica.id
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Erro ao registrar república:', error)
    return NextResponse.json(
      { message: 'Erro ao registrar república' },
      { status: 500 }
    )
  }
} 