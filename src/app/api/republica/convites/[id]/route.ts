import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const convite = await prisma.convite.findFirst({
      where: {
        id: params.id,
        republicaId: user.republica.id
      }
    })

    if (!convite) {
      return NextResponse.json(
        { message: 'Convite não encontrado' },
        { status: 404 }
      )
    }

    await prisma.convite.update({
      where: { id: params.id },
      data: { status: 'CANCELADO' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao cancelar convite:', error)
    return NextResponse.json(
      { message: 'Erro ao cancelar convite' },
      { status: 500 }
    )
  }
} 