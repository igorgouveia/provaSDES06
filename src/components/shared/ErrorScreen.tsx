import { 
  Box, 
  Button, 
  Center, 
  Heading, 
  Text, 
  VStack,
  Icon
} from '@chakra-ui/react'
import { FiAlertTriangle } from 'react-icons/fi'

type ErrorScreenProps = {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorScreen({ 
  title = 'Ops! Algo deu errado',
  message = 'Não foi possível carregar os dados. Por favor, tente novamente.',
  onRetry 
}: ErrorScreenProps) {
  return (
    <Center minH="100vh">
      <Box textAlign="center" py={10} px={6}>
        <Icon as={FiAlertTriangle} boxSize={12} color="red.500" mb={4} />
        <VStack spacing={4}>
          <Heading as="h2" size="xl">
            {title}
          </Heading>
          <Text color="gray.600">
            {message}
          </Text>
          {onRetry && (
            <Button
              colorScheme="brand"
              onClick={onRetry}
              size="lg"
              mt={4}
            >
              Tentar Novamente
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  )
} 