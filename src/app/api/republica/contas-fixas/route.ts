import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const contaFixaSchema = z.object({
  nome: z.string().min(1),
  vencimento: z.number().min(1).max(31),
  descricao: z.string().optional()
})

// Listar contas fixas
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
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

    const contasFixas = await prisma.contaFixa.findMany({
      where: {
        republicaId: user.republica.id
      },
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(contasFixas)
  } catch (error) {
    console.error('Erro ao buscar contas fixas:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar contas fixas' },
      { status: 500 }
    )
  }
}

// Criar nova conta fixa
export async function POST(request: Request) {
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
    const data = contaFixaSchema.parse(body)

    const contaFixa = await prisma.contaFixa.create({
      data: {
        ...data,
        republicaId: user.republica.id
      }
    })

    return NextResponse.json(contaFixa)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar conta fixa:', error)
    return NextResponse.json(
      { message: 'Erro ao criar conta fixa' },
      { status: 500 }
    )
  }
} 