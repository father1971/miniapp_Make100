import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 21, 22 и 23: Адаптивность, клавиатурное управление и экран загрузки', () => {
  test.beforeEach(async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);
  });

  test('21.1: Проверка адаптивности на текущем разрешении экрана', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Проверяем отсутствие горизонтального переполнения и скролла
    await checkNoHorizontalOverflow(page, 'на основном экране игры');
  });

  test('22.1: Десктопное управление клавиатурой (ArrowLeft/Right, +, -, Backspace)', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Выбираем слот 2 кликом
    const slot2 = page.getByRole('button', { name: /слот 2|slot 2/i }).first();
    await slot2.click();

    // Нажимаем клавишу '+' на физической клавиатуре
    await page.keyboard.press('+');
    await expect(slot2).toHaveText(/\+/);

    // Нажимаем стрелку вправо для перехода к следующему слоту
    await page.keyboard.press('ArrowRight');

    // Нажимаем клавишу '-'
    await page.keyboard.press('-');

    // Возвращаемся стрелкой влево и нажимаем Backspace
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Backspace');
    await expect(slot2).not.toHaveText(/\+/);
  });

  test('23.1: Защитный экран загрузки при задержке ответа сервера', async ({ page }) => {
    // Мокируем с искусственной задержкой 1000мс
    await setupApiMocks(page, { delayMs: 1000 });

    await page.goto('/?e2e=true');

    // Экран или спиннер должен плавно перейти в игровое поле без падений
    const gameArea = page.locator('.fixed.inset-0.w-full, .flex.flex-col');
    await expect(gameArea.first()).toBeVisible({ timeout: 10000 });

    await checkNoRawTranslationKeys(page, 'после экрана загрузки');
  });
});
