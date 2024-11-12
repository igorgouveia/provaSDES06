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

    const convites = await prisma.convite.findMany({
      where: { republicaId: user.republica.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(convites)
  } catch (error) {
    console.error('Erro ao buscar convites:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar convites' },
      { status: 500 }
    )
  }
} 