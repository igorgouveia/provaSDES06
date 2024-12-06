import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const registerSchema = z.object({
  token: z.string(),
  cpf: z.string(),
  dataNascimento: z.string(),
  chavePix: z.string().optional(),
  banco: z.string().optional(),
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, cpf, dataNascimento, chavePix, banco, password } = registerSchema.parse(body)

    // Verificar se o convite existe e está pendente
    const convite = await prisma.convite.findUnique({
      where: {
        token
      },
      include: {
        republica: true
      }
    })

    if (!convite || convite.status !== 'PENDENTE') {
      return NextResponse.json(
        { message: 'Convite inválido ou expirado' },
        { status: 400 }
      )
    }

    // Buscar o morador pelo email do convite
    const morador = await prisma.morador.findFirst({
      where: {
        AND: {
          republicaId: convite.republicaId,
          users: {
            none: {}  // Morador que ainda não tem usuário associado
          }
        }
      }
    })

    if (!morador) {
      return NextResponse.json(
        { message: 'Morador não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar dados do morador
    await prisma.morador.update({
      where: { id: morador.id },
      data: {
        cpf,
        dataNascimento: new Date(dataNascimento),
        chavePix,
        banco
      }
    })

    // Criar o usuário
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: morador.nome,
        email: convite.email,
        password: hashedPassword,
        role: 'MORADOR',
        moradorId: morador.id,
        republicaId: convite.republicaId
      }
    })

    // Atualizar o status do convite
    await prisma.convite.update({
      where: { token },
      data: { status: 'ACEITO' }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Erro ao completar registro:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao completar registro',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 