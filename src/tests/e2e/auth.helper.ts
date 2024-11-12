import { WebDriver, By, until } from 'selenium-webdriver'
import { config } from './config'
import { fillForm, waitForURL } from './helpers'

export async function fazerLogin(driver: WebDriver) {
  // 1. Ir para página de login
  await driver.get(`${config.baseUrl}/login`)
  
  // 2. Preencher formulário de login
  await fillForm(driver, {
    email: config.testData.republica.adminEmail,
    password: config.testData.republica.adminPassword
  })
  
  // 3. Clicar no botão de login
  const loginButton = await driver.findElement(By.css('button[type="submit"]'))
  await loginButton.click()
  
  // 4. Aguardar redirecionamento para dashboard
  await waitForURL(driver, '/dashboard')
  console.log('Login realizado com sucesso')
} 