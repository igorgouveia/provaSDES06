import { 
  Box, 
  Button, 
  Center, 
  Heading, 
  Text, 
  VStack,
  Icon
} from '@chakra-ui/react'
import { FiInbox } from 'react-icons/fi'

type EmptyStateProps = {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  title = 'Nenhum dado encontrado',
  message = 'Não há dados para exibir no momento.',
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <Center py={10}>
      <Box textAlign="center" py={10} px={6}>
        <Icon as={FiInbox} boxSize={12} color="gray.400" mb={4} />
        <VStack spacing={4}>
          <Heading as="h3" size="lg" color="gray.700">
            {title}
          </Heading>
          <Text color="gray.600">
            {message}
          </Text>
          {actionLabel && onAction && (
            <Button
              colorScheme="brand"
              onClick={onAction}
              size="lg"
              mt={4}
            >
              {actionLabel}
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  )
} 