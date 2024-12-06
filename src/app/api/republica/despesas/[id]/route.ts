import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const despesaSchema = z.object({
  tipo: z.string(),
  valor: z.number(),
  data: z.string(),
  descricao: z.string().optional(),
  tipoRateio: z.enum(['REPUBLICA', 'ESPECIFICO']),
  participantes: z.array(z.string()),
  incluiResponsavel: z.boolean()
})

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

    const despesa = await prisma.despesa.findUnique({
      where: { id: params.id },
      include: {
        responsavel: true
      }
    })

    if (!despesa) {
      return NextResponse.json(
        { message: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    if (despesa.responsavel.email !== session.user.email) {
      return NextResponse.json(
        { message: 'Você não tem permissão para editar esta despesa' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = despesaSchema.parse(body)

    const updatedDespesa = await prisma.despesa.update({
      where: { id: params.id },
      data: {
        tipo: data.tipo,
        valor: data.valor,
        data: new Date(data.data),
        descricao: data.descricao,
        tipoRateio: data.tipoRateio,
        incluiResponsavel: data.incluiResponsavel,
        participantes: {
          deleteMany: {},
          ...(data.tipoRateio === 'ESPECIFICO' && {
            create: [
              ...data.participantes.map(moradorId => ({
                moradorId
              })),
              ...(data.incluiResponsavel ? [{ moradorId: despesa.responsavelId }] : [])
            ]
          })
        }
      },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true
          }
        },
        participantes: {
          include: {
            morador: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedDespesa)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
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

    const despesa = await prisma.despesa.findUnique({
      where: { id: params.id },
      include: {
        responsavel: true
      }
    })

    if (!despesa) {
      return NextResponse.json(
        { message: 'Despesa não encontrada' },
        { status: 404 }
      )
    }

    if (despesa.responsavel.email !== session.user.email) {
      return NextResponse.json(
        { message: 'Você não tem permissão para excluir esta despesa' },
        { status: 403 }
      )
    }

    await prisma.despesaParticipante.deleteMany({
      where: { despesaId: params.id }
    })

    await prisma.despesa.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Despesa excluída com sucesso' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 