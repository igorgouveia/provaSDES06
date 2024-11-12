import { execSync } from 'child_process'

function checkFirefox() {
  try {
    // Tentar executar o Firefox para ver se está instalado
    execSync('firefox --version', { stdio: 'ignore' })
    console.log('Firefox está instalado')
  } catch (error) {
    console.error('Firefox não está instalado. Por favor, instale o Firefox para executar os testes.')
    console.error('No macOS: brew install firefox')
    console.error('No Linux: sudo apt-get install firefox')
    console.error('No Windows: Baixe e instale o Firefox do site oficial')
    process.exit(1)
  }
}

checkFirefox() 