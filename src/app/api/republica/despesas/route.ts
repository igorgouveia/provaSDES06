import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const despesaSchema = z.object({
  tipo: z.string(),
  valor: z.number().min(0),
  data: z.string(),
  descricao: z.string().optional(),
  tipoRateio: z.enum(['REPUBLICA', 'ESPECIFICO']),
  participantes: z.array(z.string()),
  incluiResponsavel: z.boolean(),
  mes: z.string().regex(/^\d{4}-\d{2}$/)
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    // Buscar morador responsável
    const responsavel = await prisma.morador.findFirst({
      where: {
        users: {
          some: {
            email: session.user.email
          }
        }
      }
    })

    if (!responsavel) {
      return NextResponse.json(
        { message: 'Morador não encontrado' },
        { status: 404 }
      )
    }

    // Buscar república do morador
    const republica = await prisma.republica.findUnique({
      where: {
        id: responsavel.republicaId
      }
    })

    if (!republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = despesaSchema.parse(body)

    // Verificar se o mês está fechado
    const fechamento = await prisma.fechamentoMes.findFirst({
      where: {
        mes: data.mes,
        republicaId: republica.id,
        status: 'fechado'
      }
    })

    if (fechamento) {
      return NextResponse.json(
        { message: 'Não é possível adicionar despesas em meses fechados' },
        { status: 400 }
      )
    }

    // Criar a despesa e seus participantes em uma transação
    const despesa = await prisma.$transaction(async (tx) => {
      // Criar a despesa
      const novaDespesa = await tx.despesa.create({
        data: {
          tipo: data.tipo,
          valor: data.valor,
          data: new Date(data.data),
          descricao: data.descricao,
          responsavelId: responsavel.id,
          republicaId: republica.id,
          tipoRateio: data.tipoRateio,
          incluiResponsavel: data.incluiResponsavel,
          mesReferencia: data.mes
        }
      })

      // Se for rateio específico, criar os participantes
      if (data.tipoRateio === 'ESPECIFICO') {
        const participantes = [
          ...data.participantes,
          ...(data.incluiResponsavel ? [responsavel.id] : [])
        ]

        await tx.despesaParticipante.createMany({
          data: participantes.map(moradorId => ({
            despesaId: novaDespesa.id,
            moradorId
          }))
        })
      }

      // Retornar a despesa com os participantes
      return await tx.despesa.findUniqueOrThrow({
        where: { 
          id: novaDespesa.id
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
    })

    return NextResponse.json(despesa)
  } catch (error) {
    console.error('Erro ao criar despesa:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro ao criar despesa' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes')

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

    const despesas = await prisma.despesa.findMany({
      where: {
        republicaId: user.republica.id,
        ...(mes ? { mesReferencia: mes } : {})
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
      },
      orderBy: {
        data: 'desc'
      }
    })

    return NextResponse.json(despesas)
  } catch (error) {
    console.error('Erro ao buscar despesas:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar despesas' },
      { status: 500 }
    )
  }
} 