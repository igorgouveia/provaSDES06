import { createTransport } from 'nodemailer'

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

export const emailTemplates = {
  convite: (republicaNome: string, link: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1890FF;">Convite para República</h1>
      <p>Olá!</p>
      <p>Você foi convidado para fazer parte da república <strong>${republicaNome}</strong>!</p>
      <p>Clique no botão abaixo para completar seu cadastro e aceitar o convite:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background-color: #1890FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Completar Cadastro
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Se você não esperava receber este convite, por favor ignore este email.</p>
    </div>
  `,

  fechamentoMes: (nome: string, valor: number, detalhes: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1890FF;">Fechamento do Mês</h1>
      <p>Olá ${nome},</p>
      <p>O fechamento do mês foi realizado.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
        <h2>Valor a pagar: R$ ${valor.toFixed(2)}</h2>
        <div>${detalhes}</div>
      </div>
    </div>
  `
} 