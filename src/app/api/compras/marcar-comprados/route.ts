import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const marcarCompradosSchema = z.object({
  ids: z.array(z.string())
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = marcarCompradosSchema.parse(body)

    await prisma.itemCompra.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: 'COMPRADO'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao marcar itens como comprados:', error)
    return NextResponse.json(
      { error: 'Erro ao marcar itens como comprados' },
      { status: 500 }
    )
  }
} 