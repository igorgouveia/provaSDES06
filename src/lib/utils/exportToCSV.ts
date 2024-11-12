export function useExportToCSV() {
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return

    // Obter cabeçalhos das colunas
    const headers = Object.keys(data[0])
    
    // Converter dados para formato CSV
    const csvRows = [
      headers.join(','), // Cabeçalhos
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Formatar data se for uma data
          if (value instanceof Date) {
            return value.toLocaleDateString()
          }
          // Escapar strings com vírgulas
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`
          }
          return value
        }).join(',')
      )
    ]

    // Criar blob e fazer download
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return exportToCSV
} 