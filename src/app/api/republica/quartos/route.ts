import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const quartoSchema = z.object({
  nome: z.string(),
  metragem: z.number().min(0),
  numMoradores: z.number().min(1),
  valor: z.number().min(0).optional(),
  descricao: z.string().optional()
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email ?? ''
      },
      include: {
        republica: {
          include: {
            quartos: true
          }
        }
      }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const quartos = await prisma.quarto.findMany({
      where: {
        republicaId: user.republica.id
      },
      include: {
        moradores: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    })

    return NextResponse.json(quartos)
  } catch (error) {
    console.error('Erro ao buscar quartos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar quartos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email ?? ''
      },
      include: {
        republica: {
          include: {
            quartos: true
          }
        }
      }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const { metragemTotal, valorAluguel } = user.republica
    if (!metragemTotal || !valorAluguel) {
      return NextResponse.json(
        { 
          message: 'Configure a metragem total e valor do aluguel da república antes de cadastrar quartos',
          code: 'CONFIGURACAO_REQUIRED'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = quartoSchema.parse(body)

    const quartosExistentes = user.republica.quartos
    const metragemUsada = quartosExistentes.reduce((acc, q) => acc + q.metragem, 0)
    const metragemDisponivel = metragemTotal - metragemUsada

    if (data.metragem > metragemDisponivel) {
      return NextResponse.json(
        { 
          message: `Metragem excede o espaço disponível. Disponível: ${metragemDisponivel}m²`,
          code: 'METRAGEM_EXCEDIDA'
        },
        { status: 400 }
      )
    }

    // Calcula o valor do quarto considerando área comum
    const valorQuarto = data.valor ?? (() => {
      // Área total dos quartos (incluindo o novo)
      const areaQuartos = metragemUsada + data.metragem
      
      // Área comum (diferença entre área total e área dos quartos)
      const areaComum = metragemTotal - areaQuartos
      
      // Total de moradores (incluindo o novo quarto)
      const totalMoradores = quartosExistentes.reduce((acc, q) => acc + q.numMoradores, 0) + data.numMoradores
      
      // Valor por área comum (dividido igualmente entre todos os moradores)
      const valorAreaComum = (areaComum / metragemTotal) * valorAluguel
      const valorPorMoradorAreaComum = valorAreaComum / totalMoradores
      const valorAreaComumQuarto = valorPorMoradorAreaComum * data.numMoradores
      
      // Valor pela área do quarto
      const valorAreaQuarto = (data.metragem / metragemTotal) * valorAluguel
      
      // Valor total do quarto (área comum + área do quarto)
      return valorAreaComumQuarto + valorAreaQuarto
    })()

    const quarto = await prisma.quarto.create({
      data: {
        ...data,
        valor: valorQuarto,
        republicaId: user.republica.id
      }
    })

    return NextResponse.json(quarto)
  } catch (error) {
    console.error('Erro ao criar quarto:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro ao criar quarto', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
} 