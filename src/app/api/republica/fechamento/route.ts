import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const fechamentoSchema = z.object({
  mes: z.string(),
  acao: z.enum(['iniciar', 'fechar', 'reabrir'])
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar usuário com morador e república
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

    const body = await request.json()
    const data = fechamentoSchema.parse(body)

    // Verifica se já existe um fechamento para este mês
    let fechamento = await prisma.fechamentoMes.findFirst({
      where: {
        mes: data.mes,
        republicaId: user.morador.republica.id
      }
    })

    if (data.acao === 'fechar') {
      if (fechamento) {
        // Atualiza o fechamento existente
        fechamento = await prisma.fechamentoMes.update({
          where: { id: fechamento.id },
          data: {
            status: 'fechado',
            dataFechamento: new Date()
          }
        })
      } else {
        // Cria um novo fechamento
        fechamento = await prisma.fechamentoMes.create({
          data: {
            mes: data.mes,
            republicaId: user.morador.republica.id,
            status: 'fechado',
            dataFechamento: new Date()
          }
        })
      }
    } else if (data.acao === 'reabrir') {
      if (fechamento) {
        // Atualiza o fechamento existente
        fechamento = await prisma.fechamentoMes.update({
          where: { id: fechamento.id },
          data: {
            status: 'aberto',
            dataFechamento: null
          }
        })
      } else {
        return NextResponse.json(
          { message: 'Não é possível reabrir um mês que não foi fechado' },
          { status: 400 }
        )
      }
    } else { // acao === 'iniciar'
      if (fechamento) {
        return NextResponse.json(
          { message: 'Este mês já foi iniciado' },
          { status: 400 }
        )
      } else {
        // Cria um novo fechamento
        fechamento = await prisma.fechamentoMes.create({
          data: {
            mes: data.mes,
            republicaId: user.morador.republica.id,
            status: 'aberto',
            dataFechamento: null
          }
        })
      }
    }

    return NextResponse.json(fechamento)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

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