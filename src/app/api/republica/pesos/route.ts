import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const pesosSchema = z.object({
  pesos: z.array(z.object({
    moradorId: z.string(),
    peso: z.number().min(0).max(10)
  }))
})

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { pesos } = pesosSchema.parse(body)

    // Atualizar pesos dos moradores
    await Promise.all(
      pesos.map(({ moradorId, peso }) =>
        prisma.morador.update({
          where: { id: moradorId },
          data: { pesoContas: peso }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar pesos:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar pesos' },
      { status: 500 }
    )
  }
} 