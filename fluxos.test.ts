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
    const options = new firefox.Options()
      .addArguments('--headless')
      .addArguments('--width=1920')
      .addArguments('--height=1080')

    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .build()

    await driver.manage().setTimeouts({ implicit: 10000 })
    await limparBancoDeDados()

    // Criar república e fazer login inicial
    await criarRepublica(driver)
    await fazerLogin(driver)
    await driver.wait(until.urlContains('/dashboard'), config.defaultTimeout)
    console.log('Setup inicial concluído')
  })

  afterAll(async () => {
    await limparBancoDeDados()
    if (driver) {
      await driver.quit()
    }
  })

  it('deve criar um novo morador', async () => {
    try {
      // Ir para página de moradores
      await driver.get(`${config.baseUrl}/moradores`)
      await waitForURL(driver, '/moradores')
      await driver.sleep(1000) // Aguardar carregamento da página

      // Clicar em Novo Morador
      const novoMoradorButton = await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Novo Morador"]')),
        10000
      )
      await novoMoradorButton.click()
      await driver.sleep(1000) // Aguardar modal abrir

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

      // Aguardar o modal fechar verificando se o botão não está mais visível
      await driver.wait(
        async () => {
          const buttons = await driver.findElements(By.xpath('//button[text()="Cadastrar Morador"]'))
          return buttons.length === 0
        },
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
      // Ir para página de transações
      await driver.get(`${config.baseUrl}/transacoes`)
      await waitForURL(driver, '/transacoes')
      await driver.sleep(1000) // Aguardar carregamento da página

      // Clicar em Nova Transação
      const novaTransacaoButton = await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Nova Transação"]')),
        10000
      )
      await novaTransacaoButton.click()
      await driver.sleep(1000) // Aguardar modal abrir

      // Preencher formulário
      const hoje = new Date().toISOString().split('T')[0]
      await fillForm(driver, {
        valor: '50',
        data: hoje,
        descricao: 'Teste de transação'
      })

      // Selecionar pagador (primeiro morador)
      const selectPagador = await driver.findElement(By.name('pagadorId'))
      await selectPagador.click()
      await driver.sleep(500)
      const opcoesPagador = await driver.findElements(By.css('select[name="pagadorId"] option'))
      if (opcoesPagador.length > 1) {
        await opcoesPagador[1].click() // Seleciona a primeira opção não vazia
      }

      // Selecionar recebedor (segundo morador)
      const selectRecebedor = await driver.findElement(By.name('recebedorId'))
      await selectRecebedor.click()
      await driver.sleep(500)
      const opcoesRecebedor = await driver.findElements(By.css('select[name="recebedorId"] option'))
      if (opcoesRecebedor.length > 2) {
        await opcoesRecebedor[2].click() // Seleciona a segunda opção não vazia
      }

      // Enviar formulário
      const cadastrarButton = await driver.findElement(By.xpath('//button[text()="Cadastrar Transação"]'))
      await cadastrarButton.click()

      // Aguardar o modal fechar
      await driver.wait(
        async () => {
          const buttons = await driver.findElements(By.xpath('//button[text()="Cadastrar Transação"]'))
          return buttons.length === 0
        },
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
      // Ir para página de compras
      await driver.get(`${config.baseUrl}/compras`)
      await waitForURL(driver, '/compras')
      await driver.sleep(1000) // Aguardar carregamento da página

      // Clicar em Novo Item
      const novoItemButton = await driver.wait(
        until.elementLocated(By.xpath('//button[contains(text(), "Novo Item")]')),
        10000
      )
      await novoItemButton.click()
      await driver.sleep(1000) // Aguardar modal abrir

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

      // Aguardar o modal fechar
      await driver.wait(
        async () => {
          const buttons = await driver.findElements(By.xpath('//button[text()="Adicionar Item"]'))
          return buttons.length === 0
        },
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