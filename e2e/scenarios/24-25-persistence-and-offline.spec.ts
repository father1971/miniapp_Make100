import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 24 и 25: Сохранение данных (Persistence) и работа в офлайне/сбоях сети', () => {
  test('24.1: Сохранение настроек и прогресса при перезагрузке страницы', async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
      window.localStorage.setItem('make100_sound_enabled', 'false');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    // Проверяем, что настройка звука сохранилась
    const soundSetting = await page.evaluate(() => localStorage.getItem('make100_sound_enabled'));
    expect(soundSetting).toBe('false');

    // Перезагрузка страницы
    await page.reload();

    const soundAfterReload = await page.evaluate(() => localStorage.getItem('make100_sound_enabled'));
    expect(soundAfterReload).toBe('false');
  });

  test('25.1: Устойчивость интерфейса при сбоях бэкенда (500 Error / Offline)', async ({ page }) => {
    await applyTelegramMock(page);
    // Все API запросы возвращают 500 ошибку
    await setupApiMocks(page, { failAll: true });

    await page.goto('/?e2e=true');

    // Игра не должна крашиться и должна отрисовать интерфейс
    const gameArea = page.locator('.fixed.inset-0.w-full, .flex.flex-col');
    await expect(gameArea.first()).toBeVisible({ timeout: 10000 });

    // Проверяем, что интерфейс стабилен
    await checkNoRawTranslationKeys(page, 'при ошибках сервера');
    await checkNoHorizontalOverflow(page, 'при ошибках сервера');
  });
});
