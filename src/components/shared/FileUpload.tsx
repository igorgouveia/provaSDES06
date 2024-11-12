'use client'

import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Image,
  Input,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react'
import { AttachmentIcon } from '@chakra-ui/icons'

type FileUploadProps = {
  onFileSelect: (base64: string) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem.',
        status: 'error'
      })
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        status: 'error'
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPreview(base64)
      onFileSelect(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <VStack spacing={4} align="stretch">
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        display="none"
      />
      
      <Button
        leftIcon={<AttachmentIcon />}
        onClick={() => inputRef.current?.click()}
      >
        Selecionar Comprovante
      </Button>

      {preview && (
        <Box>
          <Image
            src={preview}
            alt="Preview do comprovante"
            maxH="200px"
            objectFit="contain"
          />
          <Text fontSize="sm" color="gray.500" mt={2}>
            Comprovante selecionado
          </Text>
        </Box>
      )}
    </VStack>
  )
} 