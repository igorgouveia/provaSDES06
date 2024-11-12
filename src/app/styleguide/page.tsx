'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  Code,
  VStack,
  HStack,
  Divider
} from '@chakra-ui/react'

export default function StyleGuidePage() {
  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={12}>
        {/* Colors */}
        <Section title="Colors">
          <Text mb={4}>Our brand colors represent trust, reliability and innovation.</Text>
          
          <Heading size="md" mb={4}>Primary Colors</Heading>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={8}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <Box key={shade}>
                <Box
                  bg={`brand.${shade}`}
                  h="100px"
                  borderRadius="md"
                  mb={2}
                />
                <Text fontSize="sm" fontWeight="medium">
                  brand.{shade}
                </Text>
                <Code fontSize="xs">{`var(--chakra-colors-brand-${shade})`}</Code>
              </Box>
            ))}
          </SimpleGrid>

          <Heading size="md" mb={4}>Accent Colors</Heading>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <Box key={shade}>
                <Box
                  bg={`accent.${shade}`}
                  h="100px"
                  borderRadius="md"
                  mb={2}
                />
                <Text fontSize="sm" fontWeight="medium">
                  accent.{shade}
                </Text>
                <Code fontSize="xs">{`var(--chakra-colors-accent-${shade})`}</Code>
              </Box>
            ))}
          </SimpleGrid>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <Stack spacing={4}>
            <Box>
              <Text color="gray.600" mb={2}>Heading 1</Text>
              <Heading size="2xl">The quick brown fox jumps over the lazy dog</Heading>
            </Box>
            <Box>
              <Text color="gray.600" mb={2}>Heading 2</Text>
              <Heading size="xl">The quick brown fox jumps over the lazy dog</Heading>
            </Box>
            <Box>
              <Text color="gray.600" mb={2}>Heading 3</Text>
              <Heading size="lg">The quick brown fox jumps over the lazy dog</Heading>
            </Box>
            <Box>
              <Text color="gray.600" mb={2}>Body Text</Text>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </Box>
          </Stack>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <Stack spacing={8}>
            <VStack align="flex-start" spacing={4}>
              <Heading size="md">Variants</Heading>
              <HStack spacing={4}>
                <Button colorScheme="brand">Solid Button</Button>
                <Button variant="outline" colorScheme="brand">Outline Button</Button>
                <Button variant="ghost" colorScheme="brand">Ghost Button</Button>
              </HStack>
            </VStack>

            <VStack align="flex-start" spacing={4}>
              <Heading size="md">Sizes</Heading>
              <HStack spacing={4}>
                <Button size="xs" colorScheme="brand">X-Small</Button>
                <Button size="sm" colorScheme="brand">Small</Button>
                <Button size="md" colorScheme="brand">Medium</Button>
                <Button size="lg" colorScheme="brand">Large</Button>
              </HStack>
            </VStack>
          </Stack>
        </Section>

        {/* Forms */}
        <Section title="Form Elements">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Stack spacing={4}>
              <FormControl label="Input">
                <Input placeholder="Type something..." />
              </FormControl>

              <FormControl label="Select">
                <Select>
                  <option value="">Select an option</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                </Select>
              </FormControl>

              <FormControl label="Textarea">
                <Textarea placeholder="Type something..." />
              </FormControl>
            </Stack>
          </SimpleGrid>
        </Section>
      </Stack>
    </Container>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Heading mb={8}>{title}</Heading>
      {children}
      <Divider mt={12} />
    </Box>
  )
}

function FormControl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text mb={2} fontWeight="medium">{label}</Text>
      {children}
    </Box>
  )
} 