import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

type UseFormSubmitOptions = {
  onSuccess?: () => void
  successMessage?: string
  redirectTo?: string
  redirectDelay?: number
}

export function useFormSubmit(endpoint: string, options: UseFormSubmitOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const {
    onSuccess,
    successMessage = 'Operação realizada com sucesso!',
    redirectTo,
    redirectDelay = 2000
  } = options

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao processar requisição')
      }

      toast({
        title: successMessage,
        status: 'success',
        duration: 3000
      })

      if (onSuccess) {
        onSuccess()
      }

      if (redirectTo) {
        setTimeout(() => {
          router.push(redirectTo)
        }, redirectDelay)
      }

      return result
    } catch (error) {
      console.error('Erro na submissão:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao processar requisição',
        status: 'error',
        duration: 5000
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleSubmit
  }
} 