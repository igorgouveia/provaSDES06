import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { itemCompraSchema } from '@/lib/validations/itemCompra'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = itemCompraSchema.parse(body)

    const item = await prisma.itemCompra.create({
      data,
      include: {
        adicionadoPor: true
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Erro ao adicionar item:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar item' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const itens = await prisma.itemCompra.findMany({
      where: {
        status: 'PENDENTE'
      },
      include: {
        adicionadoPor: true
      },
      orderBy: [
        { urgencia: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(itens)
  } catch (error) {
    console.error('Erro ao buscar itens:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens' },
      { status: 500 }
    )
  }
} 