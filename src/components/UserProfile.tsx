import { useState } from 'react';
import { LogIn, X } from 'lucide-react';
import { UserStats, TelegramUser } from '../types';
import { TranslationData, Language } from '../translations';

export interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats | null;
  tgUser: TelegramUser | null;
  language: Language;
  t: TranslationData;
  solvedCount: number;
  unsolvedCount: number;
  totalSolveTime: number;
  bestTimeMs: number | null;
  minCharacters: number | null;
  formatBestTime: (timeMs: number | null | undefined, t?: TranslationData) => string;
  formatTotalPlayTime: (timeMs: number | null | undefined, t?: TranslationData) => string;
  formatRegistrationDate: (timestamp: number | null | undefined, lang: string, t?: TranslationData) => string;
  handleInviteFriend: () => void;
  playSound: (type: 'click' | 'success' | 'error' | 'skip') => void;
  playVibration: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export function UserProfile({
  isOpen,
  onClose,
  stats,
  tgUser,
  language,
  t,
  solvedCount,
  unsolvedCount,
  totalSolveTime,
  bestTimeMs,
  minCharacters,
  formatBestTime,
  formatTotalPlayTime,
  formatRegistrationDate,
  handleInviteFriend,
  playSound,
  playVibration,
  isGuest,
  onOpenAuth
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'referral'>('stats');
  const [avatarError, setAvatarError] = useState(false);

  if (!isOpen) return null;

  const avatarUrl = !avatarError ? (stats?.avatarUrl || tgUser?.photo_url) : undefined;
  const displayName = `${stats?.firstName || tgUser?.first_name || t.player || 'Игрок'} ${stats?.lastName || tgUser?.last_name || ''}`.trim();
  const displayUsername = stats?.username || tgUser?.username || 'user';
  const initialLetter = String(stats?.firstName || tgUser?.first_name || 'U').toUpperCase().charAt(0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playSound('click');
          playVibration('light');
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white/95 dark:bg-zinc-950/95 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl text-slate-900 dark:text-white transition-all transform animate-scale-up overflow-hidden"
        style={{
          paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 8px)',
          paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 8px)'
        }}
      >
        {/* Header окна */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-900/80 shrink-0">
          <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-orange-500">
            {t.playerProfile || 'Профиль игрока'}
          </h1>
          <button 
            onClick={() => {
              playSound('click');
              playVibration('light');
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title={t.back || 'Закрыть'}
            aria-label={t.back || 'Закрыть'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Скроллируемое тело профиля */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4 custom-scrollbar">
          {/* Horizontal Avatar Block */}
          <div className="flex items-center gap-4 bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-full overflow-hidden border-2 border-orange-500 shadow-lg shadow-orange-500/20">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-white font-black text-2xl sm:text-3xl">
                  {initialLetter}
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                {displayName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                @{displayUsername}
              </p>
            </div>
          </div>

          {/* Guest Banner if not registered */}
          {isGuest && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 flex flex-col gap-2.5 text-center">
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                {t.guestProfileNotice || "Вы играете без регистрации (в демо-версии). Войдите, чтобы сохранить свой прогресс!"}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth?.();
                  playSound('click');
                  playVibration('light');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.loginRegisterBtn || "Войти / Зарегистрироваться"}</span>
              </button>
            </div>
          )}

          {/* Compact Stats Bar */}
          <div className="grid grid-cols-4 gap-2">
            {/* Rating */}
            <div className="py-2.5 px-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-lg mb-0.5">🏆</span>
              <span className="text-base font-black text-slate-800 dark:text-slate-100">
                {stats?.score || 0}
              </span>
            </div>
            
            {/* Solved */}
            <div className="py-2.5 px-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-lg mb-0.5">✅</span>
              <span className="text-base font-black text-slate-800 dark:text-slate-100">
                {stats?.solvedCount ?? solvedCount}
              </span>
            </div>

            {/* Coins */}
            <div className="py-2.5 px-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-lg mb-0.5">🪙</span>
              <span className="text-base font-black text-amber-500 dark:text-amber-400">
                {stats?.coins || 0}
              </span>
            </div>

            {/* Hints */}
            <div className="py-2.5 px-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-lg mb-0.5">💡</span>
              <span className="text-base font-black text-blue-500 dark:text-blue-400">
                {stats?.hintsCount || 0}
              </span>
            </div>
          </div>

          {/* Segmented Tab Switch */}
          <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800">
            <button 
              onClick={() => { setActiveTab('stats'); playSound('click'); playVibration('light'); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'stats' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              📊 {t.stats || 'Статистика'}
            </button>
            <button 
              onClick={() => { setActiveTab('referral'); playSound('click'); playVibration('light'); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'referral' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              👥 {t.referral || 'Приглашения'}
            </button>
          </div>

          <div className="pt-1 pb-2">
            {activeTab === 'stats' ? (
              <div className="animate-fade-in space-y-4">
                {/* Speed / Brevity Records */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                    🏆 {t.personalRecords || 'Личные рекорды'}
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                        {t.lightningSpeed || 'Молния (Время)'}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 block">
                        ⏱️ {formatBestTime(stats?.bestTimeMs ?? bestTimeMs, t)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                        {t.brevityChars || 'Краткость (Символы)'}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 block">
                        ✍️ {(stats?.minCharacters ?? minCharacters) ? `${stats?.minCharacters ?? minCharacters} ${t.charsShort || 'симв.'}` : (t.noRecord || 'Нет рекорда')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Game Analytics */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
                    📊 {t.gameAnalytics || 'Игровая аналитика'}
                  </h3>
                  <div className="p-3.5 bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 bg-white/70 dark:bg-slate-900 rounded-xl border border-slate-200/40 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎮</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {t.sessionsPlayed || 'Сыграно сессий'}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                        {stats?.gamesStarted !== undefined ? stats.gamesStarted : 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">{t.solvedSkipped || 'Решено / Пропущено:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ✅ {stats?.solvedCount ?? solvedCount} <span className="text-slate-300 dark:text-slate-700 mx-1">|</span> ❌ {stats?.skippedCount ?? unsolvedCount ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                      <span className="text-slate-500 dark:text-slate-400">{t.thinkingTime || 'Время размышлений:'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatTotalPlayTime(stats?.totalTimeMs ?? totalSolveTime, t)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{t.firstGameDate || 'Дата первой игры:'}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        📅 {formatRegistrationDate(stats?.createdAt, language, t)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-orange-50/20 dark:from-slate-900/40 dark:to-orange-950/10 rounded-2xl border border-orange-100 dark:border-orange-900/30 space-y-3.5">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{t.friendsInvited || 'Приглашено друзей:'}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {stats?.referralCount || 0} {t.peopleShort || 'чел.'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                    <span className="text-slate-500 dark:text-slate-400">{t.bonusesEarned || 'Получено бонусов:'}</span>
                    <span className="font-extrabold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                      🪙 +{(stats?.referralCount || 0) * 500} {t.coinsCount || 'монет'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                    {t.referralPromoP1 || 'Позови друга в игру! Ты получишь'} <span className="font-bold text-orange-500">500 {t.coinsCount || 'монет'}</span>{t.referralPromoP2 || ', а друг —'} <span className="font-bold text-orange-500">250 {t.coinsCount || 'монет'}</span> {t.referralPromoP3 || 'приветственного бонуса!'}
                  </p>

                  <button
                    onClick={handleInviteFriend}
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🚀</span> {t.inviteFriendBtn || 'Пригласить друга'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
