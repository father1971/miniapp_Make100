import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарий 1: Первый запуск в браузере (гостевой режим)', () => {
  test.beforeEach(async ({ page }) => {
    // Чистим хранилища перед каждым тестом
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
    await setupApiMocks(page);
  });

  test('1.1 - 1.5: WelcomeAuthModal отображается при первом визите со всеми кнопками', async ({ page }) => {
    await page.goto('/?e2e=true');

    // Проверяем, что модалка появилась
    const welcomeModal = page.locator('[data-testid="welcome-auth-modal"], .fixed.inset-0.z-50');
    await expect(welcomeModal.first()).toBeVisible({ timeout: 10000 });

    // Проверяем кнопки
    const guestBtn = page.getByRole('button', { name: /без регистрации|guest/i });
    await expect(guestBtn.first()).toBeVisible();

    const tgBtn = page.getByRole('button', { name: /telegram/i });
    await expect(tgBtn.first()).toBeVisible();

    const emailBtn = page.getByRole('button', { name: /почт|email/i });
    await expect(emailBtn.first()).toBeVisible();

    // Проверяем отсутствие сырых ключей переводов
    await checkNoRawTranslationKeys(page, 'в WelcomeAuthModal');
    await checkNoHorizontalOverflow(page, 'на экране первого запуска');
  });

  test('1.6: Клик на "Играть без регистрации" закрывает модалку и открывает игровое поле', async ({ page }) => {
    await page.goto('/?e2e=true');

    const guestBtn = page.getByRole('button', { name: /без регистрации|guest/i }).first();
    await expect(guestBtn).toBeVisible({ timeout: 10000 });
    await guestBtn.click();

    // Проверяем, что модалка исчезла
    await expect(guestBtn).not.toBeVisible({ timeout: 5000 });

    // Игровое поле доступно: видна карточка билета или цифры
    const gameArea = page.locator('main, [data-testid="game-field"], .flex.flex-col');
    await expect(gameArea.first()).toBeVisible();

    // Проверяем установку флага в sessionStorage
    const isDismissed = await page.evaluate(() => sessionStorage.getItem('make100_welcome_dismissed'));
    expect(isDismissed).toBe('true');
  });

  test('1.7: Повторное обновление страницы не открывает WelcomeAuthModal снова в рамках сессии', async ({ page }) => {
    await page.goto('/?e2e=true');

    const guestBtn = page.getByRole('button', { name: /без регистрации|guest/i }).first();
    await guestBtn.click();

    // Перезагрузка
    await page.reload();

    // Модалка не должна появляться
    const guestBtnAfterReload = page.getByRole('button', { name: /без регистрации|guest/i });
    await expect(guestBtnAfterReload).not.toBeVisible({ timeout: 3000 });
  });
});
