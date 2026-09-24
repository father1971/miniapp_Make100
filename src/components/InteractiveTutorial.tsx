import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Plus, Minus, X, Divide, Delete, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, X as CloseIcon } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { TranslationData } from '../translations';

export interface InteractiveTutorialProps {
  onComplete: () => void;
  t: TranslationData;
  theme: 'light' | 'dark';
  playSound?: (type: string) => void;
  playVibration?: (type: string) => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onComplete,
  t,
  theme,
  playSound = () => {},
  playVibration = () => {},
}) => {
  // Step 0-4: Example 1 (Digits: 9 8 7 6 5 4)
  // Step 5-9: Example 2 (Digits: 1 2 3 4 1 0)
  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Example 1 setup
  const ex1Digits = ['9', '8', '7', '6', '5', '4'];
  const ex2Digits = ['1', '2', '3', '4', '1', '0'];

  const isEx1 = step <= 4;
  const currentDigits = isEx1 ? ex1Digits : ex2Digits;

  // Gaps state depending on step
  const getGapsForStep = (s: number): string[] => {
    switch (s) {
      case 0:
      case 1:
      case 2:
        return ['', '', '', '', '', '', ''];
      case 3:
        return ['', '', '+', '', '', '', ''];
      case 4:
        return ['', '', '+', '-', '+', '-', '']; // 98 + 7 - 6 + 5 - 4 = 100
      case 5:
        return ['', '', '', '', '', '', ''];
      case 6:
        return ['(', '', '', '', '', '', ''];
      case 7:
        return ['(', '+', '+', '+', '', '', '']; // ( 1 + 2 + 3 + 4
      case 8:
        return ['(', '+', '+', '+', ')*', '', '']; // (1 + 2 + 3 + 4) * 1 0
      case 9:
        return ['(', '+', '+', '+', ')*', '', '']; // (1+2+3+4) * 10 = 100
      default:
        return ['', '', '', '', '', '', ''];
    }
  };

  const [gaps, setGaps] = useState<string[]>(getGapsForStep(0));

  // Sync gaps and auto-selection when step changes
  useEffect(() => {
    setGaps(getGapsForStep(step));

    if (step === 2) {
      setSelectedSlot(2); // Prompt user to tap slot 2 (between 8 and 7)
    } else if (step === 3) {
      setSelectedSlot(2);
    } else if (step === 6) {
      setSelectedSlot(0); // Slot before 1
    } else if (step === 8) {
      setSelectedSlot(4); // Slot after 4
    } else {
      setSelectedSlot(null);
    }

    if (step === 4 || step === 9) {
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
        playSound('win');
        playVibration('success');
      } catch (e) {}
    }
  }, [step]);

  // Target element for pulsating cue
  const getCue = () => {
    if (step === 2) return { type: 'slot', idx: 2 };
    if (step === 3) return { type: 'op', op: '+' };
    if (step === 6) return { type: 'slot', idx: 0 };
    if (step === 8) return { type: 'slot', idx: 4 };
    return null;
  };

  const cue = getCue();

  // Navigation handlers
  const handleNext = () => {
    playSound('click');
    playVibration('light');
    if (step < 9) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    playSound('click');
    playVibration('light');
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  // Slot click handler
  const handleSlotClick = (idx: number) => {
    playSound('click');
    playVibration('light');
    setSelectedSlot(idx);

    if (step === 2 && idx === 2) {
      // User tapped the requested slot in Ex 1!
      setStep(3);
    } else if (step === 6 && idx === 0) {
      // User tapped slot 0 in Ex 2!
      setStep(7);
    } else if (step === 8 && idx === 4) {
      // User tapped slot 4 in Ex 2!
      setStep(9);
    }
  };

  // Operator click handler
  const handleOpClick = (op: string) => {
    playSound('click');
    playVibration('light');

    if (step === 3 && op === '+') {
      // User pressed '+' as requested!
      setStep(4);
    }
  };

  // Instructions content based on step
  const getStepInfo = () => {
    switch (step) {
      case 0:
        return {
          title: t.tutorialEx1Step1Title,
          desc: t.tutorialEx1Step1Desc,
          badge: `${t.tutorialStep?.replace('{current}', '1').replace('{total}', '5') || 'Шаг 1 из 5'} • Пример 1/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 1:
        return {
          title: t.tutorialEx1Step2Title,
          desc: t.tutorialEx1Step2Desc,
          badge: `${t.tutorialStep?.replace('{current}', '2').replace('{total}', '5') || 'Шаг 2 из 5'} • Пример 1/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 2:
        return {
          title: t.tutorialEx1Step3Title,
          desc: t.tutorialEx1Step3Desc,
          badge: `${t.tutorialStep?.replace('{current}', '3').replace('{total}', '5') || 'Шаг 3 из 5'} • Пример 1/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 3:
        return {
          title: t.tutorialEx1Step4Title,
          desc: t.tutorialEx1Step4Desc,
          badge: `${t.tutorialStep?.replace('{current}', '4').replace('{total}', '5') || 'Шаг 4 из 5'} • Пример 1/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 4:
        return {
          title: t.tutorialEx1Step5Title,
          desc: t.tutorialEx1Step5Desc,
          badge: `${t.tutorialStep?.replace('{current}', '5').replace('{total}', '5') || 'Шаг 5 из 5'} • Пример 1/2`,
          canNext: true,
          btnText: t.tutorialNextExample,
        };
      case 5:
        return {
          title: t.tutorialEx2Step1Title,
          desc: t.tutorialEx2Step1Desc,
          badge: `${t.tutorialStep?.replace('{current}', '1').replace('{total}', '5') || 'Шаг 1 из 5'} • Пример 2/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 6:
        return {
          title: t.tutorialEx2Step2Title,
          desc: t.tutorialEx2Step2Desc,
          badge: `${t.tutorialStep?.replace('{current}', '2').replace('{total}', '5') || 'Шаг 2 из 5'} • Пример 2/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 7:
        return {
          title: t.tutorialEx2Step3Title,
          desc: t.tutorialEx2Step3Desc,
          badge: `${t.tutorialStep?.replace('{current}', '3').replace('{total}', '5') || 'Шаг 3 из 5'} • Пример 2/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 8:
        return {
          title: t.tutorialEx2Step4Title,
          desc: t.tutorialEx2Step4Desc,
          badge: `${t.tutorialStep?.replace('{current}', '4').replace('{total}', '5') || 'Шаг 4 из 5'} • Пример 2/2`,
          canNext: true,
          btnText: t.tutorialNext,
        };
      case 9:
        return {
          title: t.tutorialEx2Step5Title,
          desc: t.tutorialEx2Step5Desc,
          badge: `${t.tutorialStep?.replace('{current}', '5').replace('{total}', '5') || 'Шаг 5 из 5'} • Пример 2/2`,
          canNext: true,
          btnText: t.tutorialFinish,
        };
      default:
        return {
          title: '',
          desc: '',
          badge: '',
          canNext: true,
          btnText: t.tutorialNext,
        };
    }
  };

  const stepInfo = getStepInfo();

  // Result display calculation
  const getResultDisplay = () => {
    if (step === 4) return '= 100';
    if (step === 9) return '= 100';
    if (step === 3) return '= 98 + 7...';
    if (step === 7) return '= (10)...';
    if (step === 8) return '= (10) * ...';
    return '= ?';
  };

  return (
    <motion.div
      key="interactive-tutorial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'} flex flex-col items-center justify-between select-none overflow-y-auto`}
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 8px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 12px)',
      }}
    >
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 w-full max-w-[440px] flex flex-col justify-between items-center h-full px-3">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between gap-2 py-1 mb-1">
          <div className="flex items-center gap-1.5 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-black tracking-wide border border-orange-500/20">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>{stepInfo.badge}</span>
          </div>

          {/* Skip Button */}
          <button
            onClick={() => {
              playSound('click');
              playVibration('light');
              onComplete();
            }}
            className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-200/60 dark:bg-zinc-800/60 py-1.5 px-3 rounded-xl transition-all cursor-pointer"
          >
            <span>{t.tutorialSkip}</span>
            <CloseIcon size={14} />
          </button>
        </header>

        {/* Step Instruction Card */}
        <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 mb-2 relative overflow-hidden transition-all duration-300">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-orange-500/30">
              {step === 4 || step === 9 ? <CheckCircle2 size={20} /> : <Sparkles size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                {stepInfo.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                {stepInfo.desc}
              </p>
            </div>
          </div>

          {/* Action buttons (Prev / Next) */}
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
            {step > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 text-xs font-bold text-zinc-600 dark:text-zinc-400 py-1.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>{t.tutorialPrev}</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              className={`flex items-center gap-1 text-xs sm:text-sm font-black py-2 px-4 rounded-xl transition-all shadow-md cursor-pointer ${
                step === 4 || step === 9
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 animate-pulse'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
              }`}
            >
              <span>{stepInfo.btnText}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Real Ticket Card Display */}
        <div className="w-full flex-1 flex items-center justify-center py-1 sm:py-2">
          <div className="w-full max-w-sm transform scale-95 sm:scale-100 transition-all duration-300">
            <TicketCard
              digits={currentDigits}
              category={isEx1 ? 'vintage-tram' : 'theatre'}
              t={t}
            />
          </div>
        </div>

        {/* Expression Builder with Slot Gaps */}
        <div className="w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-lg border border-zinc-200/60 dark:border-zinc-800/60 mb-2 flex flex-col items-center">
          <div className="flex flex-nowrap justify-center items-center gap-x-1 sm:gap-x-1.5 text-xl sm:text-2xl font-mono font-black py-1 w-full text-zinc-900 dark:text-white relative">
            {/* Slot 0 */}
            <div className="relative">
              {cue?.type === 'slot' && cue.idx === 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-md z-30">
                  👇 {t.tutorialPressHere}
                </div>
              )}
              <button
                onClick={() => handleSlotClick(0)}
                className={`w-7 sm:w-9 h-7 sm:h-9 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-bold text-xs sm:text-sm cursor-pointer ${
                  cue?.type === 'slot' && cue.idx === 0
                    ? 'border-orange-500 bg-orange-500/30 text-orange-600 scale-110 ring-4 ring-orange-500/30 animate-pulse z-20'
                    : selectedSlot === 0
                    ? 'border-orange-500 bg-orange-500/20 text-orange-500 z-10'
                    : gaps[0]
                    ? 'border-zinc-800 dark:border-zinc-200 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                    : 'border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50'
                }`}
              >
                {gaps[0] || <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
              </button>
            </div>

            {/* Digits and Slots 1..6 */}
            {currentDigits.map((digit, idx) => {
              const slotIdx = idx + 1;
              const isTargetSlot = cue?.type === 'slot' && cue.idx === slotIdx;
              const isHighlightDigits = step === 1 && (idx === 0 || idx === 1);

              return (
                <React.Fragment key={idx}>
                  <span
                    className={`font-mono text-xl sm:text-2xl font-black px-0.5 transition-all ${
                      isHighlightDigits
                        ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] font-extrabold'
                        : 'text-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    {digit}
                  </span>

                  <div className="relative">
                    {isTargetSlot && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-md z-30">
                        👇 {t.tutorialPressHere}
                      </div>
                    )}
                    <button
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`w-7 sm:w-9 h-7 sm:h-9 rounded-lg sm:rounded-xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-bold text-xs sm:text-sm cursor-pointer ${
                        isTargetSlot
                          ? 'border-orange-500 bg-orange-500/30 text-orange-600 scale-110 ring-4 ring-orange-500/30 animate-pulse z-20'
                          : selectedSlot === slotIdx
                          ? 'border-orange-500 bg-orange-500/20 text-orange-500 z-10'
                          : gaps[slotIdx]
                          ? 'border-zinc-800 dark:border-zinc-200 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900'
                          : 'border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50'
                      }`}
                    >
                      {gaps[slotIdx] || <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Result Display Bar */}
          <div className="mt-1 flex items-center justify-center h-6">
            <span
              className={`font-mono text-base sm:text-lg font-black tracking-wider transition-all duration-300 ${
                step === 4 || step === 9
                  ? 'text-emerald-500 scale-110 animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {getResultDisplay()}
            </span>
          </div>
        </div>

        {/* Real Keypad Display */}
        <div className="w-full max-w-sm grid grid-cols-4 gap-1.5 sm:gap-2 mb-2 relative">
          {/* Keypad Buttons */}
          {[
            { op: '+', label: '+', icon: <Plus size={18} strokeWidth={3} /> },
            { op: '-', label: '-', icon: <Minus size={18} strokeWidth={3} /> },
            { op: '*', label: '*', icon: <X size={18} strokeWidth={3} /> },
            { op: '/', label: '/', icon: <Divide size={18} strokeWidth={3} /> },
            { op: '(', label: '(', icon: <span className="text-lg font-black">(</span> },
            { op: ')', label: ')', icon: <span className="text-lg font-black">)</span> },
            { op: ',', label: ',', icon: <span className="text-lg font-black">,</span> },
            { op: '⌫', label: '⌫', icon: <Delete size={18} strokeWidth={2.5} />, isDanger: true },
          ].map(item => {
            const isTargetOp = cue?.type === 'op' && cue.op === item.op;

            return (
              <div key={item.op} className="relative">
                {isTargetOp && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-md z-30">
                    👆 {t.tutorialPressHere}
                  </div>
                )}
                <button
                  onClick={() => handleOpClick(item.op)}
                  className={`w-full h-10 sm:h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all active:scale-95 cursor-pointer border-2 ${
                    isTargetOp
                      ? 'border-orange-500 bg-orange-500/30 text-orange-600 scale-105 ring-4 ring-orange-500/30 animate-pulse z-20'
                      : item.isDanger
                      ? 'bg-red-50/60 dark:bg-red-500/20 text-red-500 border-red-200 dark:border-red-500/30'
                      : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {item.icon}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
