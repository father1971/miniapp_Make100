import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 4 и 5: Игровой процесс в режимах «Билет» и «Автомобиль»', () => {
  test.beforeEach(async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_tutorial_completed', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
      window.localStorage.setItem('make100_game_mode', 'ticket');
    });
    await setupApiMocks(page);
  });

  test('4.1 - 4.4: Отображение карточки билета, цифр и слотов для знаков', async ({ page }) => {
    await page.goto('/?e2e=true');

    // Кликаем "Старт" на начальном экране, если он отображается
    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Проверяем наличие основного игрового контейнера
    const gameArea = page.locator('.fixed.inset-0.w-full');
    await expect(gameArea.first()).toBeVisible({ timeout: 10000 });

    // Проверяем наличие слотов для знаков (Слот 1..7)
    const slotBtn = page.getByRole('button', { name: /слот|slot/i });
    await expect(slotBtn.first()).toBeVisible({ timeout: 5000 });

    // Проверяем кнопки математических операций
    const plusBtn = page.getByRole('button', { name: '+' });
    await expect(plusBtn.first()).toBeVisible({ timeout: 5000 });

    // Проверка верстки
    await checkNoRawTranslationKeys(page, 'в режиме Билет');
    await checkNoHorizontalOverflow(page, 'в режиме Билет');
  });

  test('4.5 - 5.2: Переключение режима на «Автомобиль» через настройки', async ({ page }) => {
    await page.goto('/?e2e=true');

    // Кликаем "Старт" на начальном экране
    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Открываем меню настроек по кнопке "Меню настроек"
    const settingsBtn = page.getByRole('button', { name: /меню настроек|settings menu/i });
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();

    // Заголовок настроек отображается
    const settingsHeader = page.locator('h2', { hasText: /настройки|settings/i });
    await expect(settingsHeader).toBeVisible({ timeout: 5000 });

    // В меню настроек кликаем кнопку "Автомобиль" / "Car"
    const carModeBtn = page.getByRole('button', { name: /^автомобиль$|^car$/i });
    await expect(carModeBtn).toBeVisible({ timeout: 5000 });
    await carModeBtn.click();

    // Закрываем меню настроек
    const closeSettingsBtn = page.locator('button[aria-label="Закрыть"], button[aria-label="Close"]');
    if (await closeSettingsBtn.isVisible({ timeout: 2000 })) {
      await closeSettingsBtn.click();
    }

    // Проверяем отсутствие ошибок верстки в режиме авто
    await checkNoRawTranslationKeys(page, 'после переключения на режим Авто');
    await checkNoHorizontalOverflow(page, 'после переключения на режим Авто');
  });
});
