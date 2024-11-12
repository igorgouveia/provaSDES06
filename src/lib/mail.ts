import nodemailer from 'nodemailer'

// Configurar o transporter do nodemailer com Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Senha de app do Gmail
  }
})

type EmailParams = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('Email service not configured')
    return
  }

  try {
    await transporter.sendMail({
      from: `República Manager <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export function getPasswordResetEmail(resetLink: string) {
  return {
    subject: 'Recuperação de Senha - República Manager',
    html: `
      <h1>Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
      <p><a href="${resetLink}">Redefinir Senha</a></p>
      <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
      <p>O link expira em 24 horas.</p>
    `
  }
}

export function getInviteEmail(inviteLink: string, republicaNome: string) {
  return {
    subject: `Convite para República ${republicaNome}`,
    html: `
      <h1>Convite para República</h1>
      <p>Você foi convidado para participar da república ${republicaNome}.</p>
      <p>Clique no link abaixo para aceitar o convite e criar sua conta:</p>
      <p><a href="${inviteLink}">Aceitar Convite</a></p>
      <p>O link expira em 48 horas.</p>
    `
  }
} 