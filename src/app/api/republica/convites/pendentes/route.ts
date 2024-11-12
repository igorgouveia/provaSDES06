import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

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

    // Buscar convites pendentes não expirados
    const convites = await prisma.convite.findMany({
      where: {
        republicaId: user.republica.id,
        status: 'PENDENTE',
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(convites)
  } catch (error) {
    console.error('Erro ao buscar convites pendentes:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar convites' },
      { status: 500 }
    )
  }
}

// Marcar convites expirados automaticamente
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Atualizar status de convites expirados
    const result = await prisma.convite.updateMany({
      where: {
        status: 'PENDENTE',
        expiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRADO'
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    })
  } catch (error) {
    console.error('Erro ao atualizar convites expirados:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar convites' },
      { status: 500 }
    )
  }
} 