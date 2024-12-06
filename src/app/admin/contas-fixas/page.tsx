'use client'

import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  useToast,
  Card,
  CardBody,
  IconButton,
  Tooltip,
  Switch,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  HStack
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign } from 'react-icons/fi'

type ContaFixa = {
  id: string
  nome: string
  tipoValor: 'FIXO' | 'VARIAVEL'
  vencimento: number
  descricao?: string
}

type ValorMensalDialogProps = {
  isOpen: boolean
  onClose: () => void
  conta: ContaFixa
  onSave: (valor: number) => Promise<void>
}

function ValorMensalDialog({ isOpen, onClose, conta, onSave }: ValorMensalDialogProps) {
  const [valor, setValor] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onSave(valor)
      onClose()
    } catch (error) {
      // Erro já tratado no componente pai
    } finally {
      setIsLoading(false)
    }
  }

  if (!conta) return null

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>
            Definir valor mensal - {conta.nome}
          </AlertDialogHeader>

          <AlertDialogBody>
            <FormControl>
              <FormLabel>Valor para este mês</FormLabel>
              <NumberInput
                value={valor}
                onChange={(_, value) => setValor(value)}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              ml={3}
              isLoading={isLoading}
            >
              Salvar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default function ContasFixasPage() {
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingConta, setEditingConta] = useState<ContaFixa | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedConta, setSelectedConta] = useState<ContaFixa | null>(null)
  const [isValorDialogOpen, setIsValorDialogOpen] = useState(false)

  useEffect(() => {
    fetchContasFixas()
  }, [])

  const fetchContasFixas = async () => {
    try {
      const response = await fetch('/api/republica/contas-fixas')
      const data = await response.json()
      setContasFixas(data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar contas fixas',
        status: 'error'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const vencimento = Number(formData.get('vencimento'))

    if (vencimento < 1 || vencimento > 31) {
      toast({
        title: 'Dia de vencimento inválido',
        description: 'O dia deve estar entre 1 e 31',
        status: 'error'
      })
      setIsLoading(false)
      return
    }

    const data = {
      nome: formData.get('nome'),
      vencimento,
      descricao: formData.get('descricao')
    }

    try {
      const url = editingConta 
        ? `/api/republica/contas-fixas/${editingConta.id}`
        : '/api/republica/contas-fixas'
      
      const response = await fetch(url, {
        method: editingConta ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Erro ao salvar conta fixa')

      toast({
        title: `Conta fixa ${editingConta ? 'atualizada' : 'criada'} com sucesso!`,
        status: 'success'
      })

      onClose()
      fetchContasFixas()
    } catch (error) {
      toast({
        title: 'Erro ao salvar conta fixa',
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta fixa?')) return

    try {
      const response = await fetch(`/api/republica/contas-fixas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao excluir conta fixa')

      toast({
        title: 'Conta fixa excluída com sucesso!',
        status: 'success'
      })

      fetchContasFixas()
    } catch (error) {
      toast({
        title: 'Erro ao excluir conta fixa',
        status: 'error'
      })
    }
  }

  const handleSetValorMensal = async (valor: number) => {
    if (!selectedConta) return

    try {
      const response = await fetch(`/api/republica/contas-fixas/${selectedConta.id}/valor-mensal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor,
          mes: new Date().toISOString().slice(0, 7) // YYYY-MM
        })
      })

      if (!response.ok) throw new Error('Erro ao definir valor mensal')

      toast({
        title: 'Valor mensal definido com sucesso!',
        status: 'success'
      })

      fetchContasFixas()
    } catch (error) {
      toast({
        title: 'Erro ao definir valor mensal',
        status: 'error'
      })
    }
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Contas Fixas</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => {
              setEditingConta(null)
              onOpen()
            }}
          >
            Nova Conta Fixa
          </Button>
        </Box>

        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Tipo</Th>
                  <Th>Vencimento</Th>
                  <Th>Descrição</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {contasFixas.map(conta => (
                  <Tr key={conta.id}>
                    <Td>{conta.nome}</Td>
                    <Td>{conta.tipoValor === 'FIXO' ? 'Fixo' : 'Variável'}</Td>
                    <Td>Dia {conta.vencimento}</Td>
                    <Td>{conta.descricao}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Editar">
                          <IconButton
                            aria-label="Editar conta"
                            icon={<FiEdit2 />}
                            size="sm"
                            onClick={() => {
                              setEditingConta(conta)
                              onOpen()
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Excluir">
                          <IconButton
                            aria-label="Excluir conta"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDelete(conta.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingConta ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    name="nome"
                    defaultValue={editingConta?.nome}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Dia do Vencimento</FormLabel>
                  <NumberInput
                    min={1}
                    max={31}
                    defaultValue={editingConta?.vencimento}
                  >
                    <NumberInputField name="vencimento" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    name="descricao"
                    defaultValue={editingConta?.descricao}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isLoading}
                  width="full"
                >
                  Salvar
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {selectedConta && (
        <ValorMensalDialog
          isOpen={isValorDialogOpen}
          onClose={() => {
            setIsValorDialogOpen(false)
            setSelectedConta(null)
          }}
          conta={selectedConta}
          onSave={handleSetValorMensal}
        />
      )}
    </Container>
  )
} 