import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const pesosSchema = z.object({
  pesos: z.array(z.object({
    moradorId: z.string(),
    contaFixaId: z.string(),
    peso: z.number().min(0).max(10)
  }))
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const pesos = await prisma.pesoContaFixa.findMany({
      where: {
        contaFixaId: params.id
      }
    })

    return NextResponse.json(pesos)
  } catch (error) {
    console.error('Erro ao buscar pesos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar pesos' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { pesos } = pesosSchema.parse(body)

    // Deletar pesos existentes
    await prisma.pesoContaFixa.deleteMany({
      where: {
        contaFixaId: params.id
      }
    })

    // Criar novos pesos
    await prisma.pesoContaFixa.createMany({
      data: pesos
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar pesos:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar pesos' },
      { status: 500 }
    )
  }
} 