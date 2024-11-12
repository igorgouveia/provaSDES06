import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const republicaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  endereco: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  descricao: z.string().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

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

    return NextResponse.json(user.republica)
  } catch (error) {
    console.error('Erro ao buscar república:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar república' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = republicaSchema.parse(body)

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

    const republica = await prisma.republica.update({
      where: { id: user.republica.id },
      data
    })

    return NextResponse.json(republica)
  } catch (error) {
    console.error('Erro ao atualizar república:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar república' },
      { status: 500 }
    )
  }
} 