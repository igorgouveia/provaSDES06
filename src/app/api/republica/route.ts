import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const republicaSchema = z.object({
  metragemTotal: z.number().min(1, 'Metragem total deve ser maior que zero'),
  valorAluguel: z.number().min(0, 'Valor do aluguel não pode ser negativo')
})

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { republica: true }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Garantir que os valores são números
    const data = republicaSchema.parse({
      metragemTotal: Number(body.metragemTotal),
      valorAluguel: Number(body.valorAluguel)
    })

    // Definir explicitamente o tipo dos dados
    const updateData: Prisma.RepublicaUpdateInput = {
      metragemTotal: data.metragemTotal,
      valorAluguel: data.valorAluguel
    }

    const republica = await prisma.republica.update({
      where: { id: user.republica.id },
      data: updateData
    })

    return NextResponse.json(republica)
  } catch (error) {
    console.error('Erro ao atualizar república:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Erro ao atualizar república',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        republica: true
      }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(user.republica)
  } catch (error) {
    console.error('Erro ao buscar república:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar república' },
      { status: 500 }
    )
  }
} 