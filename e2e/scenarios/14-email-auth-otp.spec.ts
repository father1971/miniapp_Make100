import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарий 14: Авторизация по Email (OTP 6-значный код)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await setupApiMocks(page);
  });

  test('14.1 - 14.6: Полный цикл входа по Email OTP', async ({ page }) => {
    await page.goto('/?e2e=true');

    // В WelcomeAuthModal кликаем "Войти по электронной почте"
    const emailBtn = page.getByRole('button', { name: /почт|email/i }).first();
    await expect(emailBtn).toBeVisible({ timeout: 10000 });
    await emailBtn.click();

    // Появляется форма ввода Email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await emailInput.fill('player@test.com');

    // Кликаем "Получить код"
    const getCodeBtn = page.getByRole('button', { name: /получить.*код|get code/i });
    await expect(getCodeBtn).toBeVisible();
    await getCodeBtn.click();

    // Появляется поле ввода 6-значного кода
    const codeInput = page.locator('input[placeholder="• • • • • •"], input[maxlength="6"]');
    await expect(codeInput).toBeVisible({ timeout: 5000 });
    await codeInput.fill('123456');

    // Нажимаем "Подтвердить и войти"
    const verifyBtn = page.getByRole('button', { name: /подтвердить|verify/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Модалка закрывается, токен сохранен в localStorage
    await expect(codeInput).not.toBeVisible({ timeout: 5000 });
    const token = await page.evaluate(() => localStorage.getItem('make100_web_auth_token'));
    expect(token).toBeTruthy();

    await checkNoRawTranslationKeys(page, 'после входа по Email OTP');
    await checkNoHorizontalOverflow(page, 'после входа по Email OTP');
  });
});
