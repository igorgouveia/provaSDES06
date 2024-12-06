import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { format } from 'date-fns'

const copiarMesSchema = z.object({
  mesOrigem: z.string().regex(/^\d{4}-\d{2}$/),
  mesDestino: z.string().regex(/^\d{4}-\d{2}$/)
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
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

    const body = await request.json()
    const { mesOrigem, mesDestino } = copiarMesSchema.parse(body)

    // Verificar se o mês destino está fechado
    if (user.republica.dataUltimoFechamento && 
        mesDestino <= format(user.republica.dataUltimoFechamento, 'yyyy-MM')) {
      return NextResponse.json(
        { message: 'Não é possível alterar valores de um mês fechado' },
        { status: 400 }
      )
    }

    // Buscar valores do mês origem
    const valoresOrigem = await prisma.valorMensal.findMany({
      where: {
        mes: mesOrigem,
        contaFixa: {
          republicaId: user.republica.id
        }
      }
    })

    // Copiar valores para o mês destino
    const valoresDestino = await Promise.all(
      valoresOrigem.map(valor => 
        prisma.valorMensal.upsert({
          where: {
            contaFixaId_mes: {
              contaFixaId: valor.contaFixaId,
              mes: mesDestino
            }
          },
          update: { valor: valor.valor },
          create: {
            contaFixaId: valor.contaFixaId,
            mes: mesDestino,
            valor: valor.valor
          }
        })
      )
    )

    return NextResponse.json({
      message: 'Valores copiados com sucesso',
      valores: valoresDestino
    })
  } catch (error) {
    console.error('Erro ao copiar valores:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erro ao copiar valores' },
      { status: 500 }
    )
  }
} 