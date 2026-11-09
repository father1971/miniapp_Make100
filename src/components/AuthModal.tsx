import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { authTelegramWidgetApi, authEmailLoginApi, authEmailRegisterApi, logoutWebApi } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any | null;
  onAuthSuccess: (user: any) => void;
  onLogout: () => void;
  translations: any;
  botUsername?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  translations: t,
  botUsername = 'Test_Make100_bot',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const tgWidgetContainerRef = useRef<HTMLDivElement>(null);

  // Инициализация виджета Telegram Login при открытии модалки
  useEffect(() => {
    if (!isOpen || currentUser) return;

    // Глобальная функция обратного вызова для Telegram Login Widget
    (window as any).onTelegramAuth = async (user: any) => {
      try {
        setIsSubmitting(true);
        setErrorMsg(null);
        const res = await authTelegramWidgetApi(user);
        if (res.success && res.user) {
          setSuccessMsg(t.loginSuccess || 'Успешный вход через Telegram!');
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Ошибка авторизации Telegram');
        }
      } catch (e: any) {
        setErrorMsg('Ошибка соединения с сервером');
      } finally {
        setIsSubmitting(false);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === 'register') {
        if (!name.trim()) {
          setErrorMsg('Укажите ваше имя');
          setIsSubmitting(false);
          return;
        }
        const res = await authEmailRegisterApi({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
        });
        if (res.success && res.user) {
          setSuccessMsg('Регистрация успешна! Данные сохранены.');
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Не удалось зарегистрироваться');
        }
      } else {
        const res = await authEmailLoginApi({
          email: email.trim(),
          password: password.trim(),
        });
        if (res.success && res.user) {
          setSuccessMsg('Вход выполнен успешно!');
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(res.error || 'Неверный email или пароль');
        }
      }
    } catch (err) {
      setErrorMsg('Ошибка связи с сервером');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutClick = () => {
    logoutWebApi();
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-950/95 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white transition-all transform animate-scale-up">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          title="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Экран авторизованного профиля */
          <div className="py-2 text-center">
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

            <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>
                {t.profileSyncedCloud || 'Ваш прогресс синхронизирован с облаком и участвует в мировом лидерборде!'}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 font-bold text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {t.close || 'Закрыть'}
              </button>
              <button
                type="button"
                onClick={handleLogoutClick}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs border border-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout || 'Выйти'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Форма авторизации и регистрации */
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">
                  {t.loginTitle || 'Вход в Make 100'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {t.loginSubtitle || 'Для сохранения прогресса и участия в рейтинге'}
                </p>
              </div>
            </div>

            {/* Быстрый вход через Telegram */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 text-center">
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2.5">
                ✈️ {t.loginViaTelegram || 'Быстрый вход через Telegram (1 клик)'}
              </p>
              <div
                ref={tgWidgetContainerRef}
                className="min-h-[44px] flex items-center justify-center"
              />
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <span className="relative px-3 bg-white dark:bg-zinc-950 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                {t.orViaEmail || 'или по почте'}
              </span>
            </div>

            {/* Вкладки: Вход / Регистрация */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl mb-4 border border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.loginSubmit || 'Вход'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.registerSubmit || 'Регистрация'}
              </button>
            </div>

            {/* Ошибки / Успех */}
            {errorMsg && (
              <div className="mb-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                    {t.nameLabel || 'Ваше имя'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  {t.emailLabel || 'Электронная почта'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                  {t.passwordLabel || 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>{t.loading || 'Загрузка...'}</span>
                ) : tab === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t.registerSubmit || 'Зарегистрироваться'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.loginSubmit || 'Войти'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
