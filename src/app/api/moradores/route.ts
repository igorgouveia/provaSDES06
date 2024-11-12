import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { moradorSchema } from '@/lib/validations/morador'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = moradorSchema.parse(body)

    // Verificar CPF duplicado
    const existingMorador = await prisma.morador.findUnique({
      where: { cpf: data.cpf }
    })

    if (existingMorador) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    const morador = await prisma.morador.create({
      data
    })

    return NextResponse.json(morador)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar morador' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const moradores = await prisma.morador.findMany({
      orderBy: {
        nome: 'asc'
      }
    })

    return NextResponse.json(moradores)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar moradores' },
      { status: 500 }
    )
  }
} 