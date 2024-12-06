import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email ?? ''
      },
      include: {
        morador: {
          include: {
            republica: true
          }
        },
        republica: true
      }
    })

    if (!user?.morador?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    // Buscar todos os meses abertos
    const mesesAbertos = await prisma.fechamentoMes.findMany({
      where: {
        republicaId: user.morador.republica.id,
        status: 'aberto'
      },
      orderBy: {
        mes: 'desc'
      }
    })

    return NextResponse.json({
      meses: mesesAbertos.map(m => m.mes)
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 