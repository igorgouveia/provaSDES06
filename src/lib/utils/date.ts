export function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date
  if (!date) throw new Error('Data inválida')
  
  // Se for uma string ISO (2024-02-20)
  if (date.includes('-')) {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) throw new Error('Data inválida')
    return parsedDate
  }
  
  // Se for uma string DD/MM/YYYY
  const [day, month, year] = date.split('/')
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))
  if (isNaN(parsedDate.getTime())) throw new Error('Data inválida')
  return parsedDate
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
} 