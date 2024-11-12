import { Builder, WebDriver, By, until } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox'
import { config } from './config'
import { waitForElement, fillForm, clickButton, waitForURL } from './helpers'
import { fazerLogin } from './auth.helper'
import { prisma } from '@/lib/prisma'

jest.setTimeout(90000)

describe('Fluxos E2E', () => {
  let driver: WebDriver

  const limparBancoDeDados = async () => {
    try {
      // Limpar na ordem correta para evitar erros de chave estrangeira
      await prisma.transacao.deleteMany()
      await prisma.despesa.deleteMany()
      await prisma.itemCompra.deleteMany()
      await prisma.convite.deleteMany()
      await prisma.session.deleteMany()
      await prisma.account.deleteMany()
      await prisma.user.deleteMany()
      await prisma.morador.deleteMany()
      await prisma.republica.deleteMany()
      console.log('Banco de dados limpo com sucesso')
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error)
      throw error
    }
  }

  beforeAll(async () => {
    // Configurar o Firefox
    const options = new firefox.Options()
      .addArguments('--headless')
      .addArguments('--width=1920')
      .addArguments('--height=1080')

    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build()

    await driver.manage().setTimeouts({ implicit: 10000 })

    // Limpar banco de dados antes de todos os testes
    await limparBancoDeDados()
  })

  beforeEach(async () => {
    // Limpar banco de dados antes de cada teste
    await limparBancoDeDados()

    // Criar república e fazer login inicial
    await criarRepublica(driver)
  })

  afterEach(async () => {
    // Limpar banco de dados após cada teste
    await limparBancoDeDados()
  })

  afterAll(async () => {
    // Limpar banco de dados após todos os testes
    await limparBancoDeDados()

    if (driver) {
      await driver.quit()
    }
  })

  it('deve criar um novo morador', async () => {
    try {
      await fazerLogin(driver)

      // Ir para página de moradores
      const moradoresLink = await driver.findElement(By.css('a[href="/moradores"]'))
      await moradoresLink.click()
      await waitForURL(driver, '/moradores')

      // Clicar em Novo Morador
      const novoMoradorButton = await driver.findElement(By.xpath('//button[text()="Novo Morador"]'))
      await novoMoradorButton.click()

      // Preencher formulário
      await fillForm(driver, {
        nome: 'João Silva',
        apelido: 'João',
        cpf: '12345678900',
        dataNascimento: '1995-01-01',
        quarto: 'Fundo',
        chavePix: 'joao@email.com',
        banco: 'Nubank',
        pesoContas: '1'
      })

      // Enviar formulário
      const cadastrarButton = await driver.findElement(By.xpath('//button[text()="Cadastrar Morador"]'))
      await cadastrarButton.click()

      // Aguardar modal fechar
      await driver.wait(
        until.stalenessOf(cadastrarButton),
        10000,
        'Modal não fechou após cadastro'
      )

      // Tirar screenshot
      const screenshot = await driver.takeScreenshot()
      require('fs').writeFileSync('morador-criado.png', screenshot, 'base64')

    } catch (error) {
      console.error('Erro no teste de criar morador:', error)
      throw error
    }
  })

  it('deve criar uma transação', async () => {
    try {
      await fazerLogin(driver)

      // Ir para página de transações
      const transacoesLink = await driver.findElement(By.css('a[href="/transacoes"]'))
      await transacoesLink.click()
      await waitForURL(driver, '/transacoes')

      // Clicar em Nova Transação
      const novaTransacaoButton = await driver.findElement(By.xpath('//button[text()="Nova Transação"]'))
      await novaTransacaoButton.click()

      // Preencher formulário
      const hoje = new Date().toISOString().split('T')[0]
      await fillForm(driver, {
        pagadorId: '1', // Primeiro morador da lista
        recebedorId: '2', // Segundo morador da lista
        valor: '50',
        data: hoje,
        descricao: 'Teste de transação'
      })

      // Enviar formulário
      const cadastrarButton = await driver.findElement(By.xpath('//button[text()="Cadastrar Transação"]'))
      await cadastrarButton.click()

      // Aguardar modal fechar
      await driver.wait(
        until.stalenessOf(cadastrarButton),
        10000,
        'Modal não fechou após cadastro'
      )

      // Tirar screenshot
      const screenshot = await driver.takeScreenshot()
      require('fs').writeFileSync('transacao-criada.png', screenshot, 'base64')

    } catch (error) {
      console.error('Erro no teste de criar transação:', error)
      throw error
    }
  })

  it('deve criar um item de compra', async () => {
    try {
      await fazerLogin(driver)

      // Ir para página de compras
      const comprasLink = await driver.findElement(By.css('a[href="/compras"]'))
      await comprasLink.click()
      await waitForURL(driver, '/compras')

      // Clicar em Novo Item
      const novoItemButton = await driver.findElement(By.xpath('//button[text()="Novo Item"]'))
      await novoItemButton.click()

      // Preencher formulário
      await fillForm(driver, {
        nome: 'Café',
        quantidade: '2',
        unidadeMedida: 'pacotes',
        urgencia: 'MEDIA',
        observacoes: 'Café extra forte'
      })

      // Enviar formulário
      const cadastrarButton = await driver.findElement(By.xpath('//button[text()="Adicionar Item"]'))
      await cadastrarButton.click()

      // Aguardar modal fechar
      await driver.wait(
        until.stalenessOf(cadastrarButton),
        10000,
        'Modal não fechou após cadastro'
      )

      // Tirar screenshot
      const screenshot = await driver.takeScreenshot()
      require('fs').writeFileSync('item-compra-criado.png', screenshot, 'base64')

    } catch (error) {
      console.error('Erro no teste de criar item de compra:', error)
      throw error
    }
  })
})

async function criarRepublica(driver: WebDriver) {
  await driver.get(config.baseUrl)
  
  const registerButton = await driver.wait(
    until.elementLocated(By.css('a[href="/register/republica"]')),
    config.defaultTimeout
  )
  await registerButton.click()
  
  await waitForURL(driver, '/register/republica')
  
  await fillForm(driver, {
    nome: config.testData.republica.nome,
    endereco: config.testData.republica.endereco,
    descricao: config.testData.republica.descricao,
    adminName: config.testData.republica.adminName,
    adminEmail: config.testData.republica.adminEmail,
    adminPassword: config.testData.republica.adminPassword
  })
  
  const submitButton = await driver.findElement(By.css('button[type="submit"]'))
  await submitButton.click()
  
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(), 'República criada com sucesso')]")),
    config.defaultTimeout
  )
  
  await waitForURL(driver, '/login')
  console.log('República criada com sucesso')
} 