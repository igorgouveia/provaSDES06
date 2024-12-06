import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendInviteEmail } from '@/lib/email'
import crypto from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { republica: true }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    // Buscar moradores da república
    const moradores = await prisma.user.findMany({
      where: {
        republicaId: user.republica.id,
        NOT: {
          moradorId: null  // Apenas usuários que são moradores
        }
      },
      include: {
        morador: {
          include: {
            quarto: true
          }
        }
      }
    })

    // Formatar dados para o frontend
    const moradoresFormatados = moradores.map(user => ({
      id: user.morador?.id || user.id,
      nome: user.name || user.morador?.nome || 'Sem nome',
      apelido: user.morador?.apelido || '',
      cpf: user.morador?.cpf || '',
      dataNascimento: user.morador?.dataNascimento?.toISOString() || '',
      quarto: user.morador?.quarto?.nome || '',
      chavePix: user.morador?.chavePix,
      banco: user.morador?.banco,
      ativo: user.morador?.ativo
    }))

    return NextResponse.json(moradoresFormatados)
  } catch (error) {
    console.error('Erro ao buscar moradores:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar moradores' },
      { status: 500 }
    )
  }
}

// Criar novo morador
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email ?? ''
      },
      include: {
        republica: true
      }
    })

    if (!user?.republica) {
      return NextResponse.json(
        { message: 'República não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { nome, email, quartoId } = body

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está em uso' },
        { status: 400 }
      )
    }

    // Verificar se o quarto existe e pertence à república
    const quarto = await prisma.quarto.findUnique({
      where: {
        id: quartoId,
        AND: {
          republicaId: user.republica.id
        }
      }
    })

    if (!quarto) {
      return NextResponse.json(
        { message: 'Quarto não encontrado' },
        { status: 404 }
      )
    }

    // Criar morador
    const morador = await prisma.morador.create({
      data: {
        nome,
        republica: {
          connect: {
            id: user.republica.id
          }
        },
        quarto: {
          connect: {
            id: quartoId
          }
        },
        ativo: true
      }
    })

    // Criar convite
    const token = crypto.randomUUID()

    await prisma.convite.create({
      data: {
        email,
        token,
        republica: {
          connect: {
            id: user.republica.id
          }
        }
      }
    })

    // Enviar email de convite
    await sendInviteEmail(email, token)

    return NextResponse.json(morador)
  } catch (error) {
    console.error('Erro ao criar morador:', error)
    return NextResponse.json(
      { message: 'Erro ao criar morador' },
      { status: 500 }
    )
  }
} 