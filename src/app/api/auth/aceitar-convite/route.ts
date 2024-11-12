import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const aceitarConviteSchema = z.object({
  token: z.string(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, name, password } = aceitarConviteSchema.parse(body)

    // Buscar convite
    const convite = await prisma.convite.findFirst({
      where: {
        token,
        status: 'PENDENTE',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        republica: true
      }
    })

    if (!convite) {
      return NextResponse.json(
        { message: 'Convite inválido ou expirado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email: convite.email,
        password: hashedPassword,
        role: 'MORADOR',
        republicaId: convite.republicaId
      }
    })

    // Atualizar status do convite
    await prisma.convite.update({
      where: { id: convite.id },
      data: { status: 'ACEITO' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao aceitar convite:', error)
    return NextResponse.json(
      { message: 'Erro ao aceitar convite' },
      { status: 500 }
    )
  }
} 