import React, { useEffect, useState } from 'react';
import {
  Play,
  Send,
  Sparkles,
  Moon,
  Sun,
  Globe,
  Trophy,
  Ticket,
  Car,
  Clock,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  User,
  ArrowRight,
  ChevronRight,
  Zap
} from 'lucide-react';
import { trackAnalyticsEvent } from '../utils/analytics';
import { LANGUAGES, Language } from '../translations';

interface LandingPageProps {
  onPlayWeb: () => void;
  onOpenAuth: () => void;
  onOpenFeedback: () => void;
  currentUser: any | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  translations: any;
  botUsername?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayWeb,
  onOpenAuth,
  onOpenFeedback,
  currentUser,
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
  translations: t,
  botUsername = 'Test_Make100_bot',
}) => {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Фиксация события посещения страницы при загрузке (с учетом UTM)
  useEffect(() => {
    trackAnalyticsEvent('page_view', { once: true });
  }, []);

  const handlePlayWebClick = () => {
    trackAnalyticsEvent('click_play_web');
    onPlayWeb();
  };

  const handlePlayTelegramClick = () => {
    trackAnalyticsEvent('click_play_telegram');
    const tgUrl = `https://t.me/${botUsername}?start=web_landing`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa] transition-colors duration-300 font-sans selection:bg-amber-500/20">
      {/* 🌟 ШАПКА САЙТА */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-orange-500/25">
              100
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Make 100
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Puzzle
              </span>
            </div>
          </div>

          {/* Правая панель управления */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Выбор языка */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
                title="Сменить язык"
              >
                <Globe className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <span className="uppercase">{language}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50 animate-scale-up">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLanguage(l.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                        language === l.code
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Переключатель темы (Светлая / Тёмная) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
              title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Кнопка авторизации / профиля */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
            >
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentUser ? currentUser.first_name : (t.loginSubmit || 'Войти')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚀 HERO-СЕКЦИЯ */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4">
        {/* Фоновые декоративные размытые блики */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.heroBadge || 'Интеллектуальная игра-головоломка'}</span>
          </div>

          {/* Главный заголовок */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Собери ровно{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              100
            </span>
            <br />
            из любых четырёх чисел
          </h1>

          {/* Подзаголовок */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            {t.landingSubtitle ||
              'Увлекательная математическая головоломка для тренировки ума. Решайте примеры из билетиков и номеров машин прямо в браузере или в удобном Telegram-боте!'}
          </p>

          {/* ИНТЕРАКТИВНОЕ ПРЕВЬЮ В СТИЛЕ ИГРОВЫХ КНОПОК */}
          <div className="mb-12 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-3xl bg-white/50 dark:bg-zinc-950/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-xl">
            {/* Цифры */}
            <div className="flex gap-2">
              {['2', '0', '2', '6'].map((num, i) => (
                <div
                  key={i}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 shadow-md flex items-center justify-center font-mono font-black text-xl sm:text-2xl text-slate-800 dark:text-white"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Операции и результат */}
            <div className="flex items-center gap-1.5 font-mono font-black text-amber-500 text-lg sm:text-xl px-2">
              <span>➔</span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-mono font-black text-xl sm:text-2xl shadow-lg shadow-orange-500/25 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>= 100</span>
            </div>
          </div>

          {/* 🎯 ДВА ГЛАВНЫХ ЦЕЛЕВЫХ ДЕЙСТВИЯ (CTA) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            {/* Кнопка 1: Играть в браузере */}
            <button
              type="button"
              onClick={handlePlayWebClick}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/30 active:scale-95 transition-all cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.playInBrowser || 'Играть в браузере'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Кнопка 2: Играть в Telegram */}
            <button
              type="button"
              onClick={handlePlayTelegramClick}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-3 py-4 px-7 rounded-2xl bg-white/70 dark:bg-zinc-900/80 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 font-black text-base shadow-md active:scale-95 transition-all cursor-pointer group"
            >
              <Send className="w-5 h-5 text-sky-500" />
              <span>{t.playInTelegram || 'Играть в Telegram'}</span>
            </button>
          </div>

          {/* Подсказка под кнопками */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Без установки, моментальный старт • Прогресс сохраняется</span>
          </div>
        </div>
      </section>

      {/* 🧩 БЛОК: КАК ИГРАТЬ */}
      <section className="py-12 sm:py-16 px-4 border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-950/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              {t.gameRulesTitle || 'Простые правила, бесконечный вызов'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Понятно за 30 секунд, затягивает на часы
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Шаг 1 */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold mb-2">4 числа на поле</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                В каждом раунде вам даётся 4 цифры из билета или автомобильного номера. Используйте каждое число ровно один раз.
              </p>
            </div>

            {/* Шаг 2 */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold mb-2">Знаки и скобки</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Объединяйте числа знаками +, −, ×, ÷ и скобками. Вы также можете объединять соседние цифры в двузначные числа!
              </p>
            </div>

            {/* Шаг 3 */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold mb-2">Получите ровно 100</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Как только результат уравнения станет равен 100 — раунд выигран! Получайте монеты, ставьте рекорды и поднимайтесь в рейтинге.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎮 БЛОК: РЕЖИМЫ И ФИШКИ ИГРЫ */}
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              {t.modesShowcaseTitle || 'Особенности и режимы игры'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Каждый раунд оформлен в уникальной визуальной атмосфере
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Карточка: Счастливые билеты */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">
                  {t.modeTicketsName || 'Счастливые билетики'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Тематические коллекции билетов: СССР, Цирк, Театр, Поезда, Авиация, Музеи и Парки развлечений. Настоящая ностальгия и эстетика.
                </p>
              </div>
            </div>

            {/* Карточка: Номера автомобилей */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">
                  {t.modeCarsName || 'Автомобильные номера'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Реалистичные спорткары, ретро-автомобили и внедорожники. Составляйте 100 из государственных регистрационных номеров прямо на дороге!
                </p>
              </div>
            </div>

            {/* Карточка: Гонка со временем */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">
                  {t.modeTimerName || 'Режим Таймера и Хардкор'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Проверьте скорость мышления в режиме с таймером или выберите Хардкор-режим с запретом на объединение цифр.
                </p>
              </div>
            </div>

            {/* Карточка: Мировой рейтинг и синхронизация */}
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">
                  {t.leaderboardTitle || 'Мировой лидерборд'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Соревнуйтесь с игроками со всего мира. Авторизуйтесь через Telegram или Email, чтобы ваш счёт попал в зал славы!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📱 БЛОК: ПОЧЕМУ ТЕЛЕГРАМ? */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent">
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl text-center">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center mb-4 shadow-md">
            <Send className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-3">
            Удобно играть прямо в Telegram
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
            Если вы заходите со смартфона — рекомендуем открыть нашего официального бота. Вся игра работает нативно внутри Telegram: мгновенная загрузка, автоматический вход без логинов и паролей, виброотклик и уведомления о ежедневных бонусах.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePlayTelegramClick}
              className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Перейти в Telegram-бота</span>
            </button>
            <button
              type="button"
              onClick={handlePlayWebClick}
              className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <span>Остаться в браузере</span>
            </button>
          </div>
        </div>
      </section>

      {/* 🔻 ПОДВАЛ (FOOTER) */}
      <footer className="border-t border-slate-200/60 dark:border-white/10 py-10 px-4 bg-white/40 dark:bg-zinc-950/40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-xs">
              100
            </div>
            <span className="font-bold text-slate-700 dark:text-zinc-300">Make 100 Puzzle</span>
            <span>• © 2026</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Кнопка открытия обратной связи с разработчиком */}
            <button
              type="button"
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors font-medium cursor-pointer shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.contactDeveloper || 'Написать разработчику'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
