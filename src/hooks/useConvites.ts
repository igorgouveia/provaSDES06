import { useState, useCallback } from 'react'
import { useToast } from '@chakra-ui/react'

type Convite = {
  id: string
  email: string
  status: string
  createdAt: string
  expiresAt: string
}

export function useConvites() {
  const [convites, setConvites] = useState<Convite[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const fetchConvites = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/republica/convites')
      const data = await response.json()
      if (Array.isArray(data)) {
        setConvites(data)
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar convites',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const enviarConvite = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/republica/convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao enviar convite')
      }

      toast({
        title: 'Convite enviado com sucesso!',
        status: 'success'
      })

      await fetchConvites()
    } catch (error) {
      toast({
        title: 'Erro ao enviar convite',
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, fetchConvites])

  const cancelarConvite = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/republica/convites/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar convite')
      }

      toast({
        title: 'Convite cancelado com sucesso!',
        status: 'success'
      })

      await fetchConvites()
    } catch (error) {
      toast({
        title: 'Erro ao cancelar convite',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, fetchConvites])

  const atualizarExpirados = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/republica/convites/pendentes', {
        method: 'PUT'
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar convites')
      }

      const data = await response.json()
      if (data.updatedCount > 0) {
        toast({
          title: `${data.updatedCount} convite(s) expirado(s)`,
          status: 'info'
        })
        await fetchConvites()
      }
    } catch (error) {
      toast({
        title: 'Erro ao atualizar convites',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, fetchConvites])

  return {
    convites,
    isLoading,
    fetchConvites,
    enviarConvite,
    cancelarConvite,
    atualizarExpirados
  }
} 