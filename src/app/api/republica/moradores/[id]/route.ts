import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        morador: {
          include: {
            republica: true
          }
        }
      }
    })

    if (!user?.morador?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const data = await request.json()

    const morador = await prisma.morador.update({
      where: { id: params.id },
      data: {
        nome: data.nome,
        apelido: data.apelido,
        cpf: data.cpf,
        dataNascimento: new Date(data.dataNascimento),
        quartoId: data.quartoId,
        chavePix: data.chavePix,
        banco: data.banco,
        pesoContas: data.pesoContas,
        ativo: data.ativo
      }
    })

    return NextResponse.json(morador)
  } catch (error) {
    console.error('Erro ao atualizar morador:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar morador' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        morador: {
          include: {
            republica: true
          }
        }
      }
    })

    if (!user?.morador?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    await prisma.morador.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Morador removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover morador:', error)
    return NextResponse.json(
      { message: 'Erro ao remover morador' },
      { status: 500 }
    )
  }
} 