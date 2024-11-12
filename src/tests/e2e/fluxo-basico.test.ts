import { Builder, WebDriver, By, until } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox'
import { config } from './config'
import { waitForElement, fillForm, clickButton, waitForToast, waitForURL } from './helpers'
import { prisma } from '@/lib/prisma'

jest.setTimeout(90000)

describe('Fluxo Básico', () => {
  let driver: WebDriver

  beforeAll(async () => {
    // Limpar o banco de dados antes dos testes
    try {
      await prisma.transacao.deleteMany()
      await prisma.despesa.deleteMany()
      await prisma.itemCompra.deleteMany()
      await prisma.user.deleteMany()
      await prisma.morador.deleteMany()
      await prisma.republica.deleteMany()
      await prisma.convite.deleteMany()
      console.log('Banco de dados limpo com sucesso')
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error)
    }

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
  })

  afterAll(async () => {
    // Limpar o banco de dados após os testes
    try {
      await prisma.transacao.deleteMany()
      await prisma.despesa.deleteMany()
      await prisma.itemCompra.deleteMany()
      await prisma.user.deleteMany()
      await prisma.morador.deleteMany()
      await prisma.republica.deleteMany()
      await prisma.convite.deleteMany()
      console.log('Banco de dados limpo com sucesso')
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error)
    }

    if (driver) {
      await driver.quit()
    }
  })

  afterEach(async () => {
    // Limpar o banco de dados após cada teste
    try {
      await prisma.transacao.deleteMany()
      await prisma.despesa.deleteMany()
      await prisma.itemCompra.deleteMany()
      await prisma.user.deleteMany()
      await prisma.morador.deleteMany()
      await prisma.republica.deleteMany()
      await prisma.convite.deleteMany()
      console.log('Banco de dados limpo com sucesso')
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error)
    }
  })

  it('deve criar uma república, fazer login e cadastrar despesas', async () => {
    try {
      // 1. Acessar a página inicial
      await driver.get(config.baseUrl)
      await driver.sleep(2000)
      console.log('Página inicial carregada')

      // 2. Ir para página de registro
      const registerButton = await driver.wait(
        until.elementLocated(By.css('a[href="/register/republica"]')),
        config.defaultTimeout
      )
      await registerButton.click()
      console.log('Clicou no botão de registro')

      // 3. Aguardar carregamento da página de registro
      await waitForURL(driver, '/register/republica')
      await driver.sleep(1000)
      console.log('Página de registro carregada')

      // 4. Preencher e enviar o formulário
      await fillForm(driver, {
        nome: config.testData.republica.nome,
        endereco: config.testData.republica.endereco,
        descricao: config.testData.republica.descricao,
        adminName: config.testData.republica.adminName,
        adminEmail: config.testData.republica.adminEmail,
        adminPassword: config.testData.republica.adminPassword
      })
      console.log('Formulário preenchido')

      // 5. Enviar o formulário e aguardar resposta
      const submitButton = await driver.findElement(By.css('button[type="submit"]'))
      await submitButton.click()
      console.log('Formulário enviado')

      // 6. Aguardar o toast de sucesso
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'República criada com sucesso')]")),
        config.defaultTimeout,
        'Toast de sucesso não apareceu'
      )
      console.log('Toast de sucesso exibido')

      // 7. Aguardar o redirecionamento para login (com retry)
      let attempts = 0
      const maxAttempts = 3
      while (attempts < maxAttempts) {
        try {
          await driver.wait(
            until.urlContains('/login'),
            10000,
            'Redirecionamento para login não ocorreu'
          )
          console.log('Redirecionado para login')
          break
        } catch (error) {
          attempts++
          if (attempts === maxAttempts) throw error
          await driver.sleep(2000) // Aguarda 2 segundos antes de tentar novamente
        }
      }

      // 8. Fazer login
      await fillForm(driver, {
        email: config.testData.republica.adminEmail,
        password: config.testData.republica.adminPassword
      })
      console.log('Formulário de login preenchido')

      const loginButton = await driver.findElement(By.css('button[type="submit"]'))
      await loginButton.click()
      console.log('Login enviado')

      // 9. Aguardar redirecionamento para dashboard
      await waitForURL(driver, '/dashboard')
      console.log('Redirecionado para dashboard')

      // 9. Ir para a página de despesas
      const despesasLink = await driver.wait(
        until.elementLocated(By.css('a[href="/despesas"]')),
        10000
      )
      await despesasLink.click()
      
      // 10. Clicar em Nova Despesa para primeira despesa
      const novaDespesaButton1 = await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Nova Despesa"]')),
        10000
      )
      await novaDespesaButton1.click()
      
      // 11. Preencher o formulário da primeira despesa
      await driver.wait(
        until.elementLocated(By.name('tipo')),
        10000,
        'Modal de nova despesa não abriu'
      )

      const hoje = new Date().toISOString().split('T')[0]
      await fillForm(driver, {
        tipo: 'Aluguel',
        valor: config.testData.despesa.valor.toString(),
        data: hoje,
        descricao: config.testData.despesa.descricao
      })

      await driver.sleep(500)
      
      // 12. Enviar o formulário da primeira despesa
      const cadastrarDespesaButton = await driver.findElement(
        By.xpath('//button[text()="Cadastrar Despesa"]')
      )
      await cadastrarDespesaButton.click()
      console.log('Clicou em Cadastrar Despesa')

      // 13. Aguardar o botão desaparecer (modal fechou)
      await driver.wait(
        until.stalenessOf(cadastrarDespesaButton),
        10000,
        'Modal não fechou após cadastro'
      )
      console.log('Primeira despesa cadastrada')

      // 14. Clicar em Nova Despesa para segunda despesa
      const novaDespesaButton2 = await driver.wait(
        until.elementLocated(By.xpath('//button[text()="Nova Despesa"]')),
        10000
      )
      await novaDespesaButton2.click()
      console.log('Clicou em Nova Despesa novamente')

      // 15. Preencher formulário da segunda despesa
      await driver.wait(
        until.elementLocated(By.name('tipo')),
        10000,
        'Modal de nova despesa não abriu'
      )

      const hoje2 = new Date().toISOString().split('T')[0]
      await fillForm(driver, {
        tipo: 'Água',
        valor: '150',
        data: hoje2,
        descricao: 'Conta de água do mês'
      })
      console.log('Preencheu formulário da segunda despesa')

      // 16. Enviar o formulário da segunda despesa
      const cadastrarDespesaButton2 = await driver.findElement(
        By.xpath('//button[text()="Cadastrar Despesa"]')
      )
      await cadastrarDespesaButton2.click()
      console.log('Clicou em Cadastrar Despesa')

      // 17. Aguardar o botão desaparecer (modal fechou)
      await driver.wait(
        until.stalenessOf(cadastrarDespesaButton2),
        10000,
        'Modal não fechou após cadastro'
      )
      console.log('Segunda despesa cadastrada')

      // 18. Clicar no botão de exportar
      const exportButton = await driver.findElement(
        By.xpath('//button[text()="Exportar para CSV"]')
      )
      await exportButton.click()
      console.log('Clicou em Exportar para CSV')

      // Aguardar um momento para o download iniciar e a página atualizar
      await driver.sleep(2000)

      // 19. Tirar screenshot de sucesso
      const successScreenshot = await driver.takeScreenshot()
      require('fs').writeFileSync('success-screenshot.png', successScreenshot, 'base64')
      console.log('Screenshot de sucesso salvo como success-screenshot.png')

      // 20. Salvar o CSV (simulação, já que não podemos acessar o arquivo baixado diretamente)
      const despesasCSV = [
        'Data,Tipo,Valor,Responsável,Descrição',
        `${hoje},Aluguel,1000.00,Admin Teste (Admin),Aluguel do mês`,
        `${hoje2},Água,150.00,Admin Teste (Admin),Conta de água do mês`
      ].join('\n')
      require('fs').writeFileSync('despesas.csv', despesasCSV)
      console.log('Arquivo CSV salvo como despesas.csv')

      console.log('Teste concluído com sucesso')

    } catch (error) {
      console.error('Erro detalhado no teste:', error)
      
      try {
        const screenshot = await driver.takeScreenshot()
        require('fs').writeFileSync('error-screenshot.png', screenshot, 'base64')
        console.log('Screenshot de erro salvo como error-screenshot.png')

        const pageSource = await driver.getPageSource()
        require('fs').writeFileSync('error-page.html', pageSource)
        console.log('HTML da página salvo como error-page.html')

        const currentUrl = await driver.getCurrentUrl()
        console.log('URL atual:', currentUrl)
      } catch (screenshotError) {
        console.error('Erro ao capturar informações de debug:', screenshotError)
      }

      throw error
    }
  }, 90000)
}) 