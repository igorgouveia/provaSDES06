'use client'

import { 
  Box, 
  Button, 
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/react'
import { ReactNode, FormEvent } from 'react'

type FormProps = {
  children: ReactNode
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function Form({ children, onSubmit, isLoading, submitLabel = 'Salvar' }: FormProps) {
  return (
    <Box
      as="form"
      onSubmit={onSubmit}
      noValidate
    >
      <Stack spacing={4}>
        {children}
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          fontSize="md"
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  )
}

type FormFieldProps = {
  children: ReactNode
  label: string
  name: string
  error?: string
  isRequired?: boolean
}

export function FormField({ children, label, name, error, isRequired }: FormFieldProps) {
  return (
    <Box>
      <FormControl isInvalid={!!error} isRequired={isRequired}>
        <FormLabel>{label}</FormLabel>
        {children}
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    </Box>
  )
} 