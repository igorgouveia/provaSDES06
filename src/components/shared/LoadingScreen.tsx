import { Center, Spinner, Text, VStack } from '@chakra-ui/react'

type LoadingScreenProps = {
  message?: string
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <Center minH="100vh">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="brand.500"
          size="xl"
        />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Center>
  )
} 