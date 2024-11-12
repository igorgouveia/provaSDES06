import { ReactNode } from 'react'
import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Button,
  BoxProps
} from '@chakra-ui/react'

type FormFieldProps = {
  label: string
  name: string
  error?: string
  children?: ReactNode
  isRequired?: boolean
}

export function FormField({ label, name, error, children, isRequired }: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      {children}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

type FormProps = BoxProps & {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
  submitLabel?: string
  children: ReactNode
}

export function Form({ 
  onSubmit, 
  isLoading, 
  submitLabel = 'Salvar',
  children,
  ...boxProps 
}: FormProps) {
  return (
    <Box 
      as="form" 
      onSubmit={onSubmit} 
      noValidate 
      {...boxProps}
    >
      <Stack spacing={4}>
        {children}
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  )
} 