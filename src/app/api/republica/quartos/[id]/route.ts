import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const quartoSchema = z.object({
  nome: z.string(),
  metragem: z.number().min(0),
  numMoradores: z.number().min(1),
  valor: z.number().min(0).optional(),
  descricao: z.string().optional()
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const data = quartoSchema.parse(body)

    const quarto = await prisma.quarto.update({
      where: { id: params.id },
      data
    })

    return NextResponse.json(quarto)
  } catch (error) {
    console.error('Erro ao atualizar quarto:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro ao atualizar quarto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    await prisma.quarto.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir quarto:', error)
    return NextResponse.json(
      { message: 'Erro ao excluir quarto' },
      { status: 500 }
    )
  }
} 