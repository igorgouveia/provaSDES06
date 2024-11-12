export function validateCPF(cpf: string): boolean {
  if (!cpf) return false

  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '')

  if (cpf.length !== 11) return false

  // Verifica CPFs com dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validação dos dígitos verificadores
  let sum = 0
  let remainder: number

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
} 