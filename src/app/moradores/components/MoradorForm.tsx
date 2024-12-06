'use client'

import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Select,
  FormHelperText,
  Checkbox
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

type Quarto = {
  id: string
  nome: string
}

type Morador = {
  id: string
  nome: string
  apelido: string
  cpf: string
  dataNascimento: string
  quarto: string
  chavePix?: string
  banco?: string
  ativo?: boolean
  email?: string
}

type MoradorFormProps = {
  morador?: Morador | null
  onSuccess: () => void
}

export function MoradorForm({ morador, onSuccess }: MoradorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [enviarConvite, setEnviarConvite] = useState(true)
  const [formData, setFormData] = useState({
    nome: '',
    apelido: '',
    cpf: '',
    dataNascimento: '',
    quartoId: '',
    chavePix: '',
    banco: '',
    ativo: true,
    email: ''
  })
  const toast = useToast()

  useEffect(() => {
    if (morador) {
      setFormData({
        nome: morador.nome,
        apelido: morador.apelido || '',
        cpf: morador.cpf || '',
        dataNascimento: morador.dataNascimento || '',
        quartoId: morador.quarto,
        chavePix: morador.chavePix || '',
        banco: morador.banco || '',
        ativo: morador.ativo !== false,
        email: morador.email || ''
      })
      setEnviarConvite(false)
    }
  }, [morador])

  useEffect(() => {
    const fetchQuartos = async () => {
      try {
        const response = await fetch('/api/republica/quartos')
        if (!response.ok) throw new Error('Erro ao buscar quartos')
        const data = await response.json()
        setQuartos(data)
      } catch (error) {
        console.error(error)
        toast({
          title: 'Erro ao buscar quartos',
          status: 'error'
        })
      }
    }

    fetchQuartos()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Criar/atualizar morador
      const url = morador 
        ? `/api/republica/moradores/${morador.id}`
        : '/api/republica/moradores'
      
      const method = morador ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `Erro ao ${morador ? 'atualizar' : 'criar'} morador`)
      }

      // Se for novo morador e tiver email, enviar convite
      if (!morador && formData.email && enviarConvite) {
        const conviteResponse = await fetch('/api/republica/convite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        })

        if (!conviteResponse.ok) {
          const error = await conviteResponse.json()
          throw new Error(error.message || 'Erro ao enviar convite')
        }
      }

      toast({
        title: `Morador ${morador ? 'atualizado' : 'adicionado'} com sucesso!`,
        status: 'success'
      })

      onSuccess()
    } catch (error) {
      toast({
        title: `Erro ao ${morador ? 'atualizar' : 'adicionar'} morador`,
        description: error instanceof Error ? error.message : 'Tente novamente',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input 
            name="nome" 
            value={formData.nome}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input 
            name="email" 
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <FormHelperText>
            O email será usado para enviar o convite de acesso ao sistema
          </FormHelperText>
        </FormControl>

        {!morador && formData.email && (
          <FormControl>
            <Checkbox
              isChecked={enviarConvite}
              onChange={(e) => setEnviarConvite(e.target.checked)}
            >
              Enviar convite por email
            </Checkbox>
          </FormControl>
        )}

        <FormControl>
          <FormLabel>Apelido</FormLabel>
          <Input 
            name="apelido" 
            value={formData.apelido}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>CPF</FormLabel>
          <Input 
            name="cpf" 
            value={formData.cpf}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Data de Nascimento</FormLabel>
          <Input 
            name="dataNascimento" 
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Quarto</FormLabel>
          <Select 
            name="quartoId" 
            value={formData.quartoId}
            onChange={handleChange}
            placeholder="Selecione um quarto"
          >
            {quartos.map(quarto => (
              <option key={quarto.id} value={quarto.id}>
                {quarto.nome}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Chave Pix</FormLabel>
          <Input 
            name="chavePix" 
            value={formData.chavePix}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Banco</FormLabel>
          <Input 
            name="banco" 
            value={formData.banco}
            onChange={handleChange}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
          width="full"
        >
          {morador ? 'Atualizar' : 'Adicionar'} Morador
        </Button>
      </VStack>
    </form>
  )
} 