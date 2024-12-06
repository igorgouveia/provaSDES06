import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export async function sendInviteEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${baseUrl}/register/complete?token=${token}`

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Convite para República',
    html: `
      <h1>Bem-vindo à República!</h1>
      <p>Você foi convidado para fazer parte da república.</p>
      <p>Para completar seu cadastro, clique no link abaixo:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>Este link expira em 24 horas.</p>
    `
  })
} 