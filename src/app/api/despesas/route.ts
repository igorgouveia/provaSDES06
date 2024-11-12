import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { despesaSchema } from '@/lib/validations/despesa'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = despesaSchema.parse(body)

    const despesa = await prisma.despesa.create({
      data,
      include: {
        responsavel: true
      }
    })

    return NextResponse.json(despesa)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar despesa' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const dataInicial = searchParams.get('dataInicial')
  const dataFinal = searchParams.get('dataFinal')

  try {
    const despesas = await prisma.despesa.findMany({
      where: {
        tipo: tipo || undefined,
        data: {
          gte: dataInicial ? new Date(dataInicial) : undefined,
          lte: dataFinal ? new Date(dataFinal) : undefined
        }
      },
      include: {
        responsavel: true
      },
      orderBy: {
        data: 'desc'
      }
    })

    return NextResponse.json(despesas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar despesas' },
      { status: 500 }
    )
  }
} 