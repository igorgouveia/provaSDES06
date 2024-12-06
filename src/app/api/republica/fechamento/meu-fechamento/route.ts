import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const mes = searchParams.get('mes')

    if (!mes) {
      return NextResponse.json(
        { message: 'Mês não informado' },
        { status: 400 }
      )
    }

    // Buscar o morador atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        morador: {
          include: {
            quarto: true,
            republica: true
          }
        }
      }
    })

    if (!user?.morador) {
      return NextResponse.json(
        { message: 'Morador não encontrado' },
        { status: 404 }
      )
    }

    // Buscar contas fixas do mês
    const contasFixas = await prisma.contaFixa.findMany({
      where: {
        republicaId: user.morador.republica.id
      },
      include: {
        valores: {
          where: { mes }
        }
      }
    })

    // Calcular valor das contas fixas
    const valoresContasFixas = await Promise.all(contasFixas.map(async conta => {
      const valorMensal = conta.valores[0]?.valor || 0

      // Buscar todos os pesos desta conta fixa
      const pesosContaFixa = await prisma.pesoContaFixa.findMany({
        where: {
          contaFixaId: conta.id,
          moradorId: user.morador.id
        }
      })
      const pesosContaFixaTotal = await prisma.pesoContaFixa.findMany({
        where: {
          contaFixaId: conta.id,
        }
      })

      console.log('Pesos da conta fixa:', pesosContaFixa)

      // Peso do morador atual para esta conta
      const pesoMorador = pesosContaFixa[0]?.peso || 0
      console.log('Peso do morador:', pesoMorador)
      // Soma de todos os pesos para esta conta
      const somaPesos = pesosContaFixaTotal.reduce((acc, p) => acc + (p.peso || 0), 0)
      console.log('Soma de todos os pesos:', somaPesos)
      
      return {
        nome: conta.nome,
        valor: somaPesos > 0 ? (valorMensal * pesoMorador) / somaPesos : 0
      }
    }))

    // Buscar despesas do mês que o morador participa
    const despesas = await prisma.despesa.findMany({
      where: {
        AND: [
          { republicaId: user.morador.republica.id },
          { mesReferencia: mes },
          {
            OR: [
              { responsavelId: user.morador.id },
              {
                participantes: {
                  some: { moradorId: user.morador.id }
                }
              }
            ]
          }
        ]
      },
      include: {
        participantes: true,
        responsavel: {
          select: {
            nome: true
          }
        }
      }
    })

    // Calcular valor das despesas
    const todasDespesas = despesas.map(despesa => {
      const isParticipante = despesa.participantes.some(p => p.moradorId === user.morador.id);
      const isResponsavel = despesa.responsavelId === user.morador.id;
      
      let valorCalculado = 0;
      if (despesa.tipoRateio === 'REPUBLICA') {
        valorCalculado = despesa.valor / despesa.participantes.length;
      } else {
        if (isResponsavel && !isParticipante) {
          valorCalculado = despesa.valor;
        } else if (isParticipante) {
          valorCalculado = despesa.valor / despesa.participantes.length;
        }
      }

      return {
        tipo: despesa.tipo,
        descricao: despesa.descricao,
        valor: valorCalculado,
        data: despesa.data.toISOString(),
        responsavel: {
          nome: despesa.responsavel.nome
        },
        isDesconto: isResponsavel && !isParticipante && despesa.tipoRateio !== 'REPUBLICA'
      };
    });

    const despesasRegulares = todasDespesas.filter(d => !d.isDesconto);
    const descontos = todasDespesas.filter(d => d.isDesconto);

    // Valor do aluguel (baseado no quarto)
    const valorAluguel = user.morador.quarto?.valor || 0

    // Buscar status do fechamento
    const fechamento = await prisma.fechamentoMes.findFirst({
      where: {
        mes,
        republicaId: user.morador.republica.id
      }
    })

    // Calcular total
    const totalContasFixas = valoresContasFixas.reduce((acc, conta) => acc + conta.valor, 0)
    const totalDespesasRegulares = despesasRegulares.reduce((acc, despesa) => acc + despesa.valor, 0)
    const totalDescontos = descontos.reduce((acc, desconto) => acc + desconto.valor, 0)
    const total = totalContasFixas + totalDespesasRegulares + valorAluguel - totalDescontos

    return NextResponse.json({
      mes,
      aluguel: valorAluguel,
      contasFixas: valoresContasFixas,
      despesas: despesasRegulares,
      descontos: descontos,
      total,
      detalhes: {
        totalContasFixas,
        totalDespesasRegulares,
        totalDescontos,
        valorAluguel
      },
      status: fechamento?.status || 'aberto'
    })
  } catch (error) {
    console.error('Erro ao buscar fechamento:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar fechamento' },
      { status: 500 }
    )
  }
} 