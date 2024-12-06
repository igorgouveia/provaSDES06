import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const valorMensalSchema = z.object({
  valor: z.number().min(0),
  mes: z.string().regex(/^\d{4}-\d{2}$/) // YYYY-MM
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { valor, mes } = valorMensalSchema.parse(body)

    // Atualizar ou criar valor mensal
    await prisma.valorMensal.upsert({
      where: {
        contaFixaId_mes: {
          contaFixaId: params.id,
          mes
        }
      },
      update: { valor },
      create: {
        contaFixaId: params.id,
        mes,
        valor
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao definir valor mensal:', error)
    return NextResponse.json(
      { message: 'Erro ao definir valor mensal' },
      { status: 500 }
    )
  }
} 