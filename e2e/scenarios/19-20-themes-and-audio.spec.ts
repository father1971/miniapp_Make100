import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 19 и 20: Темы оформления, звук и виброотклик (Haptic Feedback)', () => {
  test('19.1: Темная тема оформления', async ({ page }) => {
    await applyTelegramMock(page, { colorScheme: 'dark' });
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);

    await checkNoHorizontalOverflow(page, 'в темной теме');
  });

  test('19.2: Светлая тема оформления', async ({ page }) => {
    await applyTelegramMock(page, { colorScheme: 'light' });
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(false);

    await checkNoHorizontalOverflow(page, 'в светлой теме');
  });

  test('20.1: Вызов Telegram HapticFeedback при нажатии на разрешенный оператор', async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Выбираем слот 2 (между цифрой 1 и 2, где разрешен знак +)
    const slot2 = page.getByRole('button', { name: /слот 2|slot 2/i }).first();
    await expect(slot2).toBeVisible({ timeout: 5000 });
    await slot2.click();

    // Нажимаем плюс
    const plusBtn = page.getByRole('button', { name: '+' }).first();
    await expect(plusBtn).toBeEnabled({ timeout: 5000 });
    await plusBtn.click();

    // Проверяем, что зафиксирован вызов Haptic
    const hapticCalls = await page.evaluate(() => (window as any).__telegramHapticCalls || []);
    expect(hapticCalls.length).toBeGreaterThan(0);
  });
});
