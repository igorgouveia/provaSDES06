import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional()
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = updateProfileSchema.parse(body)

    // Se está tentando alterar a senha, verificar a senha atual
    if (data.currentPassword && data.newPassword) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (!user?.password) {
        return NextResponse.json(
          { message: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      const isValid = await bcrypt.compare(data.currentPassword, user.password)

      if (!isValid) {
        return NextResponse.json(
          { message: 'Senha atual incorreta' },
          { status: 400 }
        )
      }
    }

    // Atualizar usuário
    const updateData: any = { name: data.name }
    if (data.newPassword) {
      updateData.password = await bcrypt.hash(data.newPassword, 10)
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
} 