import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'

export function useFechamento() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'aberto' | 'fechado'>('aberto')
  const toast = useToast()

  const fecharMes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/republica/fechamento', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erro ao fechar mês')
      }

      setStatus('fechado')
      toast({
        title: 'Mês fechado com sucesso!',
        description: 'Os emails foram enviados para todos os moradores.',
        status: 'success'
      })
    } catch (error) {
      toast({
        title: 'Erro ao fechar mês',
        description: 'Tente novamente mais tarde.',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isLoading,
    status,
    fecharMes
  }
} 