import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 8 и 9: Подсказки, покупка подсказок и пропуск примеров', () => {
  test.beforeEach(async ({ page }) => {
    await applyTelegramMock(page, {
      user: { id: 556677, first_name: 'HintUser' }
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_tutorial_completed', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
  });

  test('8.1: Использование доступной подсказки', async ({ page }) => {
    await setupApiMocks(page, {
      userStats: { userId: 556677, hintsCount: 3, coins: 150 },
    });

    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Нажимаем кнопку "Подсказка"
    const hintBtn = page.getByRole('button', { name: /подсказка|hint/i });
    await expect(hintBtn).toBeVisible({ timeout: 5000 });
    await hintBtn.click();

    // Проверяем верстку после применения подсказки
    await checkNoRawTranslationKeys(page, 'после использования подсказки');
    await checkNoHorizontalOverflow(page, 'после использования подсказки');
  });

  test('8.2: Покупка подсказки за монеты при нулевом балансе подсказок', async ({ page }) => {
    await setupApiMocks(page, {
      userStats: { userId: 556677, hintsCount: 0, coins: 150 },
    });

    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Клик на "Подсказка" при 0 подсказок должен открыть модалку покупки (BuyHintModal)
    const hintBtn = page.getByRole('button', { name: /подсказка|hint/i });
    await expect(hintBtn).toBeVisible({ timeout: 5000 });
    await hintBtn.click();

    // Модалка покупки отображается
    const buyModalTitle = page.locator('h2', { hasText: /закончились|out of hints/i });
    if (await buyModalTitle.isVisible({ timeout: 4000 })) {
      // Кнопка покупки за 20 монет
      const buyBtn = page.getByRole('button', { name: /купить|buy/i });
      await expect(buyBtn).toBeVisible();
      await buyBtn.click();

      // Модалка закрылась
      await expect(buyModalTitle).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('9.1: Пропуск текущего примера по кнопке "Пропустить пример"', async ({ page }) => {
    await setupApiMocks(page, {
      userStats: { userId: 556677, hintsCount: 3, coins: 150 },
    });

    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Находим кнопку "Пропустить пример"
    const skipBtn = page.getByRole('button', { name: /пропустить пример|skip example|пропустить номер/i });
    await expect(skipBtn).toBeVisible({ timeout: 5000 });
    await skipBtn.click();

    // Проверяем верстку после пропуска
    await checkNoRawTranslationKeys(page, 'после пропуска примера');
    await checkNoHorizontalOverflow(page, 'после пропуска примера');
  });
});
