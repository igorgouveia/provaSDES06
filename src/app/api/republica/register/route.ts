import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { republicaSchema } from '@/lib/validations/republica'
import crypto from 'crypto'

function generateUniqueCPF() {
  // Gera um número aleatório de 11 dígitos
  return crypto.randomBytes(6).toString('hex').slice(0, 11)
}

export async function POST(request: Request) {
  try {
    console.log('Iniciando registro de república') // Debug

    const body = await request.json()
    console.log('Dados recebidos:', body) // Debug

    const data = republicaSchema.parse(body)

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10)

    // Criar admin, morador e república em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar morador admin primeiro com CPF único
      const morador = await tx.morador.create({
        data: {
          nome: data.adminName,
          apelido: 'Admin', // Valor padrão para admin
          cpf: generateUniqueCPF(), // Gera um CPF único
          dataNascimento: new Date(), // Valor temporário, deve ser atualizado depois
          quarto: 'Admin', // Valor padrão para admin
          pesoContas: 1
        }
      })

      // Criar usuário admin com campos mínimos necessários
      const admin = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          moradorId: morador.id,
        }
      })

      // Criar república com o adminId já definido
      const republica = await tx.republica.create({
        data: {
          nome: data.nome,
          endereco: data.endereco,
          descricao: data.descricao,
          adminId: admin.id,
          users: {
            connect: {
              id: admin.id
            }
          }
        }
      })

      // Atualizar o usuário admin com o ID da república
      await tx.user.update({
        where: { id: admin.id },
        data: { republicaId: republica.id }
      })

      return { admin, republica, morador }
    })

    // Remover senha do retorno
    const { password: _, ...adminWithoutPassword } = result.admin

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword,
      republica: result.republica,
      morador: result.morador
    })
  } catch (error) {
    console.error('Erro ao registrar república:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao criar república' },
      { status: 500 }
    )
  }
} 