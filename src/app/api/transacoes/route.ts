import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transacaoSchema } from '@/lib/validations/transacao'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = transacaoSchema.parse(body)

    // Verificar se o pagador tem saldo suficiente
    const pagador = await prisma.morador.findUnique({
      where: { id: data.pagadorId },
      include: {
        pagamentos: true,
        recebimentos: true
      }
    })

    if (!pagador) {
      return NextResponse.json(
        { error: 'Pagador não encontrado' },
        { status: 404 }
      )
    }

    // Calcular saldo
    const saldoPagamentos = pagador.pagamentos.reduce((acc: number, t) => acc + t.valor, 0)
    const saldoRecebimentos = pagador.recebimentos.reduce((acc: number, t) => acc + t.valor, 0)
    const saldoPagador = saldoRecebimentos - saldoPagamentos

    if (saldoPagador < data.valor) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      )
    }

    const transacao = await prisma.transacao.create({
      data: {
        ...data,
        data: new Date(data.data),
        status: 'ATIVA'
      },
      include: {
        pagador: true,
        recebedor: true
      }
    })

    return NextResponse.json(transacao)
  } catch (error) {
    console.error('Erro ao criar transação:', error)
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pagadorId = searchParams.get('pagadorId')
  const recebedorId = searchParams.get('recebedorId')
  const dataInicial = searchParams.get('dataInicial')
  const dataFinal = searchParams.get('dataFinal')

  try {
    const transacoes = await prisma.transacao.findMany({
      where: {
        pagadorId: pagadorId || undefined,
        recebedorId: recebedorId || undefined,
        data: {
          gte: dataInicial ? new Date(dataInicial) : undefined,
          lte: dataFinal ? new Date(dataFinal) : undefined
        },
        status: 'ATIVA'
      },
      include: {
        pagador: true,
        recebedor: true
      },
      orderBy: {
        data: 'desc'
      }
    })

    return NextResponse.json(transacoes)
  } catch (error) {
    console.error('Erro ao buscar transações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    )
  }
} 