import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes')

    if (!mes) {
      return NextResponse.json(
        { message: 'Mês não informado' },
        { status: 400 }
      )
    }

    const fechamento = await prisma.fechamentoMes.findFirst({
      where: {
        mes,
        republicaId: user.morador.republica.id
      }
    })

    return NextResponse.json({
      status: fechamento ? {
        status: fechamento.status,
        dataFechamento: fechamento.dataFechamento
      } : {
        status: 'nao_usado',
        dataFechamento: null
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 