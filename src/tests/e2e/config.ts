export const config = {
  baseUrl: 'http://localhost:3000',
  defaultTimeout: 30000, // Aumentado para 30 segundos
  testData: {
    republica: {
      nome: 'República Teste E2E',
      endereco: 'Rua dos Testes, 123',
      descricao: 'República para testes automatizados',
      adminName: 'Admin Teste',
      adminEmail: 'admin.teste@example.com',
      adminPassword: 'senha123'
    },
    despesa: {
      tipo: 'Aluguel',
      valor: 1000,
      descricao: 'Aluguel do mês'
    }
  }
} 