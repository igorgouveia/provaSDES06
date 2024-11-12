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
  IconButton,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { FiHome, FiUsers, FiDollarSign, FiShoppingBag, FiRepeat } from 'react-icons/fi'
import NextLink from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useApp } from '@/contexts/AppContext'
import { useRouter, usePathname } from 'next/navigation'

type NavItemProps = {
  href: string
  icon: any
  children: React.ReactNode
  isActive?: boolean
}

function NavItem({ href, icon, children, isActive }: NavItemProps) {
  return (
    <Link
      as={NextLink}
      href={href}
      px={3}
      py={2}
      rounded="md"
      display="flex"
      alignItems="center"
      gap={2}
      color={isActive ? 'brand.500' : 'gray.700'}
      _hover={{
        bg: useColorModeValue('gray.100', 'gray.700'),
        color: 'brand.500',
        transform: 'translateY(-2px)',
        transition: 'all 0.2s'
      }}
      fontWeight={isActive ? 'semibold' : 'medium'}
    >
      <Icon as={icon} boxSize={5} />
      <Text>{children}</Text>
    </Link>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  const { isAdmin } = useApp()
  const pathname = usePathname()
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
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <HStack spacing={8} alignItems="center">
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

            {session && (
              <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                <NavItem 
                  href="/dashboard" 
                  icon={FiHome}
                  isActive={pathname === '/dashboard'}
                >
                  Dashboard
                </NavItem>
                <NavItem 
                  href="/moradores" 
                  icon={FiUsers}
                  isActive={pathname === '/moradores'}
                >
                  Moradores
                </NavItem>
                <NavItem 
                  href="/despesas" 
                  icon={FiDollarSign}
                  isActive={pathname === '/despesas'}
                >
                  Despesas
                </NavItem>
                <NavItem 
                  href="/transacoes" 
                  icon={FiRepeat}
                  isActive={pathname === '/transacoes'}
                >
                  Transações
                </NavItem>
                <NavItem 
                  href="/compras" 
                  icon={FiShoppingBag}
                  isActive={pathname === '/compras'}
                >
                  Compras
                </NavItem>
              </HStack>
            )}
          </HStack>

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