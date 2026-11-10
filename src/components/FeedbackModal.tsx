import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { submitFeedbackApi } from '../api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations: any;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  translations: t,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      setErrorMsg(t.feedbackEmptyError || 'Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitFeedbackApi({
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setName('');
          setContact('');
          setMessage('');
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.error || t.feedbackError || 'Не удалось отправить сообщение. Попробуйте еще раз.');
      }
    } catch (err: any) {
      setErrorMsg(t.feedbackError || 'Ошибка соединения с сервером');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {t.feedbackModalTitle || 'Связь с разработчиком'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t.feedbackModalDesc || 'Напишите нам свои идеи, вопросы или отзывы'}
            </p>
          </div>
        </div>

        {/* Уведомление об успешной отправке */}
        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {t.feedbackSuccess || 'Сообщение отправлено!'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {t.feedbackSuccessSub || 'Разработчик получил ваше сообщение в Telegram и скоро ответит.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                {t.feedbackNameLabel || 'Ваше имя'}
              </label>
              <input
                type="text"
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.feedbackNamePlaceholder || 'Как к вам обращаться?'}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                {t.feedbackContactLabel || 'Контакт для ответа'}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t.feedbackContactPlaceholder || '@username в Telegram или email@domain.com'}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 mb-1">
                {t.feedbackMessageLabel || 'Сообщение'}
              </label>
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.feedbackMessagePlaceholder || 'Ваш вопрос, пожелание или найденная ошибка...'}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {t.cancel || 'Отмена'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-orange-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span>{t.feedbackSending || 'Отправка...'}</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.feedbackSendBtn || 'Отправить'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
