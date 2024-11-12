import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from '@chakra-ui/react'

type StatCardProps = {
  label: string
  value: string | number
  helpText?: string
}

export function StatCard({ label, value, helpText }: StatCardProps) {
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="sm"
      border="1px solid"
      borderColor={borderColor}
    >
      <Stat>
        <StatLabel color="gray.500" fontSize="sm">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText color="gray.500" fontSize="sm">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  )
} 