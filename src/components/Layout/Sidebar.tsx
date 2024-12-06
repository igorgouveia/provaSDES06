'use client'

import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiShoppingBag, 
  FiRepeat, 
  FiTool, 
  FiCalendar,
  FiPercent,
  FiCheckSquare
} from 'react-icons/fi'
import { useApp } from '@/contexts/AppContext'

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
      px={4}
      py={3}
      rounded="md"
      display="flex"
      alignItems="center"
      gap={3}
      color={isActive ? 'brand.500' : 'gray.700'}
      _hover={{
        bg: useColorModeValue('gray.100', 'gray.700'),
        color: 'brand.500',
        transform: 'translateX(2px)',
        transition: 'all 0.2s'
      }}
      fontWeight={isActive ? 'semibold' : 'medium'}
      width="full"
    >
      <Icon as={icon} boxSize={5} />
      <Text>{children}</Text>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useApp()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/moradores', label: 'Moradores', icon: FiUsers },
    { href: '/despesas', label: 'Despesas', icon: FiDollarSign },
    { href: '/transacoes', label: 'Transações', icon: FiRepeat },
    { href: '/compras', label: 'Compras', icon: FiShoppingBag },
    { href: '/meu-fechamento', label: 'Meu Fechamento', icon: FiCalendar },
    { href: '/calculadora', label: 'Calculadora', icon: FiTool },
  ]

  const adminLinks = [
    { href: '/admin/contas-fixas', label: 'Contas Fixas', icon: FiDollarSign },
    { href: '/admin/pesos-contas', label: 'Pesos por Conta', icon: FiPercent },
    { href: '/admin/quartos', label: 'Quartos', icon: FiHome },
    { href: '/admin/fechamento', label: 'Fechamento', icon: FiCheckSquare }
  ]

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={16} // altura da navbar
      h="calc(100vh - 4rem)" // altura total menos altura da navbar
      w="250px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      py={4}
      overflowY="auto"
    >
      <VStack spacing={1} align="stretch" px={2}>
        {userLinks.map(link => (
          <NavItem
            key={link.href}
            href={link.href}
            icon={link.icon}
            isActive={pathname === link.href}
          >
            {link.label}
          </NavItem>
        ))}

        {isAdmin && (
          <>
            <Divider my={4} />
            <Text px={4} py={2} fontSize="sm" fontWeight="semibold" color="gray.500">
              Administração
            </Text>
            {adminLinks.map(link => (
              <NavItem
                key={link.href}
                href={link.href}
                icon={link.icon}
                isActive={pathname === link.href}
              >
                {link.label}
              </NavItem>
            ))}
          </>
        )}
      </VStack>
    </Box>
  )
} 