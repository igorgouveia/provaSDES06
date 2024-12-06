import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    const cobrancas = await prisma.cobranca.findMany({
      where: {
        AND: [
          { republicaId: user.republica.id },
          user.role !== 'ADMIN' ? { moradorId: user.id } : {}
        ]
      },
      include: {
        morador: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cobrancas.map(c => ({
      ...c,
      morador: {
        nome: c.morador.name || 'Sem nome'
      }
    })))
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar cobranças' },
      { status: 500 }
    )
  }
} 