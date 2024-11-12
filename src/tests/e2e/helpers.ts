import { WebDriver, By, until } from 'selenium-webdriver'
import { config } from './config'

export async function waitForElement(driver: WebDriver, selector: string, timeout = config.defaultTimeout) {
  const element = await driver.wait(
    until.elementLocated(By.css(selector)),
    timeout
  )
  return await driver.wait(until.elementIsVisible(element), timeout)
}

export async function fillForm(driver: WebDriver, formData: Record<string, string>) {
  for (const [name, value] of Object.entries(formData)) {
    const element = await driver.findElement(By.name(name))
    const tagName = await element.getTagName()

    if (tagName === 'select') {
      await element.click()
      const option = await driver.findElement(By.css(`select[name="${name}"] option[value="${value}"]`))
      await option.click()
    } else {
      await element.clear()
      await element.sendKeys(value)
    }

    await driver.sleep(100)
  }
}

export async function clickButton(driver: WebDriver, text: string) {
  const button = await driver.wait(
    until.elementLocated(By.xpath(`//button[contains(text(), '${text}')]`)),
    config.defaultTimeout,
    `Botão com texto "${text}" não encontrado`
  )
  await driver.wait(until.elementIsVisible(button), config.defaultTimeout)
  await button.click()
}

export async function waitForToast(driver: WebDriver, text: string) {
  // Aguardar o toast aparecer usando diferentes estratégias
  try {
    // Tentar pelo texto exato
    await driver.wait(
      until.elementLocated(By.xpath(`//*[text()='${text}']`)),
      config.defaultTimeout,
      `Toast com texto "${text}" não encontrado`
    )
  } catch (error) {
    // Se não encontrar pelo texto exato, tentar pelo texto parcial
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)),
      config.defaultTimeout,
      `Toast com texto "${text}" não encontrado`
    )
  }

  // Aguardar um pouco para garantir que o usuário veria o toast
  await driver.sleep(1000)
}

export async function waitForURL(driver: WebDriver, urlPart: string) {
  await driver.wait(
    until.urlContains(urlPart),
    config.defaultTimeout,
    `URL não mudou para "${urlPart}"`
  )
  // Aguardar um pouco para a página carregar
  await driver.sleep(1000)
} 