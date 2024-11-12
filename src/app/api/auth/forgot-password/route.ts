import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'
import { sendEmail, getPasswordResetEmail } from '@/lib/mail'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Não revelar se o usuário existe ou não
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Gerar link de reset
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    // Enviar email
    const { subject, html } = getPasswordResetEmail(resetLink)
    await sendEmail({
      to: email,
      subject,
      html
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error)
    return NextResponse.json(
      { message: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
} 