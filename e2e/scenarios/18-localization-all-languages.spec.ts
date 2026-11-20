import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

const ALL_20_LANGUAGES = [
  'ru', 'en', 'de', 'fr', 'es', 'it', 'pt', 'tr',
  'ar', 'he', 'hi', 'zh', 'ja', 'ko', 'la', 'eo',
  'elvish', 'klingon', 'dothraki', 'valyrian',
] as const;

test.describe('Сценарий 18: Локализация — проверка всех 20 поддерживаемых языков', () => {
  for (const lang of ALL_20_LANGUAGES) {
    test(`18.x: Проверка интерфейса на языке "${lang}"`, async ({ page }) => {
      await applyTelegramMock(page, {
        user: { id: 1000 + ALL_20_LANGUAGES.indexOf(lang), first_name: `User_${lang}`, language_code: lang },
      });

      // Принудительно устанавливаем выбранный пользователем язык
      await page.addInitScript((l) => {
        window.localStorage.setItem('make100_language', l);
        window.localStorage.setItem('make100_user_chose_lang', 'true');
        window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
        window.localStorage.setItem('make100_save_bot_dismissed', 'true');
      }, lang);

      await setupApiMocks(page);

      await page.goto('/?e2e=true');

      // Кликаем старт, если отображается
      const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
      if (await startBtn.isVisible({ timeout: 2000 })) {
        await startBtn.click();
      }

      // Главный экран виден
      const gameArea = page.locator('.fixed.inset-0.w-full');
      await expect(gameArea.first()).toBeVisible({ timeout: 10000 });

      // Проверяем отсутствие битых ключей и непереведенных строк
      await checkNoRawTranslationKeys(page, `на языке ${lang}`);
      await checkNoHorizontalOverflow(page, `на языке ${lang}`);
    });
  }
});
