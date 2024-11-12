'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  Flex,
  useColorModeValue,
  Image,
  chakra,
  shouldForwardProp
} from '@chakra-ui/react'
import { motion, isValidMotionProp, HTMLMotionProps } from 'framer-motion'
import { FiHome, FiDollarSign, FiUsers, FiCheckCircle, FiArrowRight } from 'react-icons/fi'
import NextLink from 'next/link'

// Definir tipo para o ChakraBox
type Merge<P, T> = Omit<P, keyof T> & T;
type MotionBoxProps = Merge<HTMLMotionProps<"div">, any>;

// Componente com animação corrigido
const ChakraBox = chakra(motion.div, {
  shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
}) as React.FC<MotionBoxProps>

const features = [
  {
    title: 'Gestão de Moradores',
    text: 'Cadastre e gerencie todos os moradores da república de forma simples e organizada.',
    icon: FiUsers,
    color: 'blue.400'
  },
  {
    title: 'Controle Financeiro',
    text: 'Acompanhe despesas, receitas e divisão de contas entre os moradores.',
    icon: FiDollarSign,
    color: 'green.400'
  },
  {
    title: 'Lista de Compras',
    text: 'Organize as compras coletivas e mantenha todos atualizados.',
    icon: FiHome,
    color: 'purple.400'
  },
  {
    title: 'Gestão de Tarefas',
    text: 'Distribua e acompanhe as tarefas da casa de forma justa e transparente.',
    icon: FiCheckCircle,
    color: 'pink.400'
  }
]

export default function HomePage() {
  return (
    <Box>
      {/* Hero Section com gradiente e animação */}
      <Box
        bg="linear-gradient(135deg, #1890FF 0%, #EB2F96 100%)"
        color="white"
        py={32}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <Stack spacing={8} alignItems="center" textAlign="center">
            <ChakraBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 } as any}
            >
              <Heading
                size="3xl"
                fontWeight="extrabold"
                lineHeight="shorter"
                letterSpacing="tight"
                mb={4}
              >
                Gerencie sua República com{' '}
                <Text
                  as="span"
                  bgGradient="linear(to-r, yellow.400, orange.400)"
                  bgClip="text"
                >
                  Facilidade
                </Text>
              </Heading>
              <Text fontSize="xl" maxW="2xl" opacity={0.9}>
                Uma plataforma completa para administrar sua república universitária.
                Simplifique a gestão de moradores, despesas e tarefas.
              </Text>
            </ChakraBox>

            <ChakraBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 } as any}
            >
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={4}
                mt={8}
              >
                <Button
                  as={NextLink}
                  href="/register/republica"
                  size="lg"
                  bg="white"
                  color="brand.500"
                  _hover={{
                    bg: 'gray.100',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  rightIcon={<FiArrowRight />}
                >
                  Começar Agora
                </Button>
                <Button
                  as={NextLink}
                  href="/login"
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  _hover={{
                    bg: 'whiteAlpha.200',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                >
                  Fazer Login
                </Button>
              </Stack>
            </ChakraBox>
          </Stack>
        </Container>

        {/* Elementos decorativos */}
        <Box
          position="absolute"
          top="-10%"
          left="-5%"
          width="120%"
          height="120%"
          opacity={0.1}
          bgImage="url('/patterns/dots.svg')"
          bgRepeat="repeat"
          bgSize="24px"
          transform="rotate(-5deg)"
        />
      </Box>

      {/* Features Section com animações */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Stack spacing={12}>
            <ChakraBox
              textAlign="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heading mb={4}>Tudo que você precisa em um só lugar</Heading>
              <Text color="gray.600" fontSize="lg">
                Funcionalidades pensadas para facilitar a gestão da sua república
              </Text>
            </ChakraBox>

            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 4 }}
              spacing={8}
              mt={8}
            >
              {features.map((feature, index) => (
                <ChakraBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Stack
                    bg="white"
                    p={8}
                    borderRadius="2xl"
                    boxShadow="lg"
                    height="100%"
                    transition="all 0.3s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'xl'
                    }}
                  >
                    <Flex
                      w={12}
                      h={12}
                      bg={feature.color}
                      color="white"
                      borderRadius="xl"
                      align="center"
                      justify="center"
                      mb={4}
                    >
                      <Icon as={feature.icon} boxSize={6} />
                    </Flex>
                    <Heading size="md" mb={2}>
                      {feature.title}
                    </Heading>
                    <Text color="gray.600">{feature.text}</Text>
                  </Stack>
                </ChakraBox>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section com gradiente e animação */}
      <Box
        bg="linear-gradient(135deg, #EB2F96 0%, #1890FF 100%)"
        color="white"
        py={20}
      >
        <Container maxW="container.xl">
          <ChakraBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Stack
              direction={{ base: 'column', lg: 'row' }}
              spacing={8}
              align="center"
              justify="space-between"
            >
              <Stack spacing={4} maxW="2xl">
                <Heading>Pronto para começar?</Heading>
                <Text fontSize="lg" opacity={0.9}>
                  Crie sua conta gratuitamente e comece a gerenciar sua república de
                  forma mais eficiente hoje mesmo.
                </Text>
                <Stack direction="row" spacing={4}>
                  <Button
                    as={NextLink}
                    href="/register/republica"
                    size="lg"
                    bg="white"
                    color="brand.500"
                    rightIcon={<FiArrowRight />}
                    _hover={{
                      bg: 'gray.100',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                  >
                    Criar Conta Grátis
                  </Button>
                  <Button
                    as={NextLink}
                    href="/about"
                    size="lg"
                    variant="outline"
                    borderColor="white"
                    _hover={{
                      bg: 'whiteAlpha.200',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                  >
                    Saiba Mais
                  </Button>
                </Stack>
              </Stack>
              <Box
                boxSize={{ base: '300px', lg: '400px' }}
                position="relative"
              >
                {/* Adicionar uma ilustração ou imagem aqui */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  width="120%"
                  height="120%"
                  opacity={0.1}
                  bgImage="url('/patterns/dots.svg')"
                  bgRepeat="repeat"
                  bgSize="24px"
                />
              </Box>
            </Stack>
          </ChakraBox>
        </Container>
      </Box>
    </Box>
  )
}
