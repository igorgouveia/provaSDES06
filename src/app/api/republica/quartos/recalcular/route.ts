import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    const { metragemTotal, valorAluguel, quartos } = user.republica
    if (!metragemTotal || !valorAluguel) {
      return NextResponse.json(
        { 
          message: 'Configure a metragem total e valor do aluguel da república antes de recalcular quartos',
          code: 'CONFIGURACAO_REQUIRED'
        },
        { status: 400 }
      )
    }

    // Área total dos quartos
    const areaQuartos = quartos.reduce((acc, q) => acc + q.metragem, 0)
    
    // Área comum (diferença entre área total e área dos quartos)
    const areaComum = metragemTotal - areaQuartos
    
    // Total de moradores
    const totalMoradores = quartos.reduce((acc, q) => acc + q.numMoradores, 0)

    // Atualizar cada quarto
    const updatedQuartos = await Promise.all(quartos.map(async (quarto) => {
      // Valor por área comum (dividido igualmente entre todos os moradores)
      const valorAreaComum = (areaComum / metragemTotal) * valorAluguel
      const valorPorMoradorAreaComum = valorAreaComum / totalMoradores
      const valorAreaComumQuarto = valorPorMoradorAreaComum * quarto.numMoradores
      
      // Valor pela área do quarto
      const valorAreaQuarto = (quarto.metragem / metragemTotal) * valorAluguel
      
      // Valor total do quarto (área comum + área do quarto)
      const novoValor = valorAreaComumQuarto + valorAreaQuarto

      return prisma.quarto.update({
        where: { id: quarto.id },
        data: { valor: novoValor }
      })
    }))

    return NextResponse.json({
      message: 'Valores dos quartos recalculados com sucesso',
      quartos: updatedQuartos
    })
  } catch (error) {
    console.error('Erro ao recalcular quartos:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao recalcular quartos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 