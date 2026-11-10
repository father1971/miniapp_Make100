import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Send,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import {
  authTelegramWidgetApi,
  sendEmailOtpApi,
  verifyEmailOtpApi,
  logoutWebApi
} from '../api';
import { trackAnalyticsEvent } from '../utils/analytics';

interface WelcomeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
  currentUser: any | null;
  onAuthSuccess: (user: any) => void;
  onLogout: () => void;
  translations: any;
  botUsername?: string;
}

export const WelcomeAuthModal: React.FC<WelcomeAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
  currentUser,
  onAuthSuccess,
  onLogout,
  translations: t,
  botUsername = 'Test_Make100_bot',
}) => {
  // Состояния для входа по email (OTP)
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const tgWidgetContainerRef = useRef<HTMLDivElement>(null);

  // Инициализация виджета Telegram Login при открытии модалки
  useEffect(() => {
    if (!isOpen || currentUser) return;

    (window as any).onTelegramAuth = async (user: any) => {
      try {
        setStatusMsg(null);
        const res = await authTelegramWidgetApi(user);
        if (res.success && res.user) {
          setStatusMsg({ type: 'success', text: t.loginSuccess || 'Успешный вход через Telegram!' });
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 1000);
        } else {
          setStatusMsg({ type: 'error', text: res.error || 'Ошибка авторизации Telegram' });
        }
      } catch (e: any) {
        setStatusMsg({ type: 'error', text: 'Ошибка соединения с сервером' });
      }
    };

    const container = tgWidgetContainerRef.current;
    if (container) {
      container.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '16');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      container.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [isOpen, currentUser, botUsername]);

  if (!isOpen) return null;

  // Клик "Играть без регистрации"
  const handlePlayGuest = () => {
    trackAnalyticsEvent('click_play_web');
    try {
      sessionStorage.setItem('make100_welcome_dismissed', 'true');
    } catch (e) {}
    onClose();
  };

  // Клик "Играть в Telegram"
  const handlePlayTelegram = () => {
    trackAnalyticsEvent('click_play_telegram');
    const tgUrl = `https://t.me/${botUsername}?start=web_modal`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Отправка 6-значного кода на email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!email.trim() || !email.includes('@')) {
      setStatusMsg({ type: 'error', text: 'Укажите корректный адрес электронной почты' });
      return;
    }

    setIsSendingCode(true);
    try {
      const res = await sendEmailOtpApi({
        email: email.trim(),
        name: name.trim() || undefined,
      });

      if (res.success) {
        setEmailStep('verify');
        setStatusMsg({
          type: 'success',
          text: res.devCode
            ? `Код отправлен! (Тестовый код: ${res.devCode})`
            : '6-значный код отправлен на вашу почту!',
        });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Не удалось отправить код' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Ошибка соединения с сервером' });
    } finally {
      setIsSendingCode(false);
    }
  };

  // Подтверждение 6-значного кода
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setStatusMsg({ type: 'error', text: 'Введите 6-значный код подтверждения' });
      return;
    }

    setIsVerifyingCode(true);
    try {
      const res = await verifyEmailOtpApi({
        email: email.trim(),
        code: otpCode.trim(),
        name: name.trim() || undefined,
      });

      if (res.success && res.user) {
        setStatusMsg({ type: 'success', text: 'Успешный вход! Вы останетесь в системе на этом устройстве.' });
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Неверный или просроченный код' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Ошибка соединения с сервером' });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleLogout = () => {
    logoutWebApi();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-950/95 border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white transition-all transform animate-scale-up my-auto">
        {/* Кнопка закрытия (крестик) */}
        <button
          onClick={handlePlayGuest}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title="Закрыть и играть"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Экран уже авторизованного пользователя */
          <div className="text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/25 mb-3">
              {currentUser.photo_url ? (
                <img
                  src={currentUser.photo_url}
                  alt={currentUser.first_name || 'User'}
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                (currentUser.first_name || 'U')[0].toUpperCase()
              )}
            </div>

            <h2 className="text-xl font-black tracking-tight">
              {currentUser.first_name} {currentUser.last_name || ''}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
              {currentUser.username ? `@${currentUser.username}` : currentUser.email || `ID: ${currentUser.id}`}
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{t.welcomeAuthSavedCloud || 'Ваш прогресс сохраняется в облаке и участвует в мировом лидерборде!'}</span>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {t.welcomeContinueGame || 'Продолжить игру'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.welcomeLogout || 'Выйти'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Главный экран приветствия и выбора режима для неавторизованного пользователя */
          <div>
            {/* Шапка модального окна */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-orange-500/25 shrink-0">
                100
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight leading-tight">
                  {t.welcomeModalTitle || 'Добро пожаловать в Make 100!'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {t.welcomeModalSubtitle || 'Выберите удобный способ игры:'}
                </p>
              </div>
            </div>

            {/* Сообщения статуса */}
            {statusMsg && (
              <div
                className={`mb-3.5 p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                }`}
              >
                {statusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* 🎮 ОСНОВНЫЕ КНОПКИ ДЕЙСТВИЯ */}
            <div className="space-y-2.5">
              {/* 1. Играть без регистрации (Главная кнопка быстрого старта) */}
              <button
                type="button"
                onClick={handlePlayGuest}
                className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-sm font-black">
                        {t.playGuestBtn || 'Играть без регистрации'}
                      </div>
                      <div className="text-[11px] text-white/85">
                        {t.playGuestSub || 'Быстрый старт прямо здесь • сохранение в браузере'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* 2. Играть в Telegram */}
              <button
                type="button"
                onClick={handlePlayTelegram}
                className="w-full text-left p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 active:scale-98 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black">
                        {t.playInTelegram || 'Играть в Telegram-боте'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {t.playInTelegramSub || 'Идеально со смартфона • вход в 1 клик'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-sky-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* 🔐 БЛОК СОХРАНЕНИЯ В ОБЛАКЕ И РЕЙТИНГА */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-white/10">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {t.welcomeLeaderboardHeader || '🏆 Сохранение рекордов и мировой рейтинг'}
                </span>
              </div>

              {/* Вход через Telegram Widget */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 text-center mb-2.5">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                  {t.welcomeTgWidgetTitle || 'Быстрый вход через Telegram в 1 клик:'}
                </div>
                <div
                  ref={tgWidgetContainerRef}
                  className="min-h-[42px] flex items-center justify-center"
                />
              </div>

              {/* Вход по Email через 6-значный код */}
              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-white/60 dark:bg-zinc-900/40 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.welcomeEmailBtn || 'Войти по электронной почте (код на Email)'}</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-white/10 animate-fade-in">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t.welcomeEmailTitle || 'Вход по 6-значному коду на Email'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {t.welcomeCollapse || 'Свернуть'}
                    </button>
                  </div>

                  {emailStep === 'input' ? (
                    <form onSubmit={handleSendCode} className="space-y-2.5">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.welcomeNamePlaceholder || 'Ваше имя (для таблицы рекордов)'}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.welcomeEmailPlaceholder || 'Ваш email: player@example.com'}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingCode}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSendingCode ? (t.welcomeSending || 'Отправка...') : (t.welcomeGetCodeBtn || 'Получить 6-значный код ✉️')}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-2.5">
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {t.welcomeEnterCodeText || 'Введите 6 цифр из письма, отправленного на'} <strong className="text-slate-700 dark:text-zinc-200">{email}</strong>:
                      </p>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-base font-mono tracking-widest text-center text-slate-900 dark:text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEmailStep('input')}
                          className="px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-bold"
                        >
                          {t.welcomeBackBtn || 'Назад'}
                        </button>
                        <button
                          type="submit"
                          disabled={isVerifyingCode}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isVerifyingCode ? (t.welcomeVerifying || 'Проверка...') : (t.welcomeVerifyBtn || 'Подтвердить и войти 🚀')}
                        </button>
                      </div>
                    </form>
                  )}
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-2 text-center">
                    {t.welcomeSessionNotice || '🔒 Вход запоминается на 1 год, повторный ввод кода не потребуется!'}
                  </p>
                </div>
              )}
            </div>

            {/* Подвал с обратной связью */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={onOpenFeedback}
                className="inline-flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t.contactDeveloper || 'Написать разработчику'}</span>
              </button>
              <span>Make 100 Puzzle • 2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
