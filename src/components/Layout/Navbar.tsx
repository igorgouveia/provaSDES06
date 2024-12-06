'use client'

import {
  Box,
  Flex,
  Link,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Container,
  Icon,
  HStack,
  Text,
  Avatar,
  MenuDivider,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { FiUsers } from 'react-icons/fi'
import NextLink from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useApp } from '@/contexts/AppContext'

export function Navbar() {
  const { data: session } = useSession()
  const { isAdmin } = useApp()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      bg={bgColor}
      position="sticky"
      top={0}
      zIndex={100}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
      h="4rem"
    >
      <Container maxW="container.xl" h="full">
        <Flex h="full" alignItems="center" justifyContent="space-between">
          <Link
            as={NextLink}
            href="/dashboard"
            fontSize="xl"
            fontWeight="bold"
            color="brand.500"
            _hover={{ textDecoration: 'none' }}
          >
            República Manager
          </Link>

          {session ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={session.user.name || undefined}
                    src={session.user.image || undefined}
                    bg="brand.500"
                  />
                  <Text display={{ base: 'none', md: 'block' }}>
                    {session.user.name}
                  </Text>
                  <ChevronDownIcon />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={NextLink} href="/perfil" icon={<Icon as={FiUsers} />}>
                  Perfil
                </MenuItem>
                {isAdmin && (
                  <>
                    <MenuDivider />
                    <MenuItem as={NextLink} href="/admin" color="brand.500" fontWeight="semibold">
                      Painel Admin
                    </MenuItem>
                  </>
                )}
                <MenuDivider />
                <MenuItem 
                  onClick={() => signOut()}
                  color="red.500"
                >
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={4}>
              <Button
                as={NextLink}
                href="/login"
                variant="ghost"
                colorScheme="brand"
              >
                Login
              </Button>
              <Button
                as={NextLink}
                href="/register/republica"
                colorScheme="brand"
              >
                Registrar República
              </Button>
            </HStack>
          )}
        </Flex>
      </Container>
    </Box>
  )
} 