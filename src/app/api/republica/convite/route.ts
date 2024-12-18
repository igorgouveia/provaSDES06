import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, getInviteEmail } from '@/lib/mail'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const conviteSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email } = conviteSchema.parse(body)

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Usuário já cadastrado' },
        { status: 400 }
      )
    }

    // Buscar a república do admin
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { republica: true }
    })

    if (!admin?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    // Gerar token do convite usando UUID
    const token = uuidv4()

    // Criar convite
    const convite = await prisma.convite.create({
      data: {
        email,
        token,
        republicaId: admin.republica.id
      }
    })

    // Enviar email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register/complete?token=${token}`
    const { subject, html } = getInviteEmail(inviteLink, admin.republica.nome)
    await sendEmail({
      to: email,
      subject,
      html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar convite:', error)
    return NextResponse.json(
      { message: 'Erro ao enviar convite' },
      { status: 500 }
    )
  }
} 