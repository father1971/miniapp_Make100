import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Plus, Minus, X, Divide, Delete, Sparkles, CheckCircle2, ChevronRight, ChevronLeft, X as CloseIcon } from 'lucide-react';
import { TicketCard } from './TicketCard';
import { TranslationData } from '../translations';

export interface InteractiveTutorialProps {
  onComplete: () => void;
  t: TranslationData;
  theme: 'light' | 'dark';
  playSound?: (type: 'click' | 'success' | 'error' | 'skip') => void;
  playVibration?: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onComplete,
  t,
  theme,
  playSound = () => {},
  playVibration = () => {},
}) => {
  // Steps:
  // --- Пример 1: 9 8 7 6 5 4 ---
  // 0: Введение в цель игры (9 8 7 6 5 4)
  // 1: Объяснение склейки 9 и 8 в 98
  // 2: Выбрать слот 2 (между 8 и 7)
  // 3: Нажать '+' (gaps[2] = '+')
  // 4: Выбрать слот 3 (между 7 и 6)
  // 5: Нажать '-' (gaps[3] = '-')
  // 6: Выбрать слот 4 (между 6 и 5)
  // 7: Нажать '+' (gaps[4] = '+')
  // 8: Выбрать слот 5 (между 5 и 4)
  // 9: Нажать '-' (gaps[5] = '-') -> 98 + 7 - 6 + 5 - 4 = 100!
  // 10: Успех Примера 1 (кнопка перейти к Примеру 2)
  //
  // --- Пример 2: 1 2 3 4 1 0 ---
  // 11: Введение во 2-й пример (зачем нужны скобки)
  // 12: Выбрать слот 0 (перед 1)
  // 13: Нажать '(' (gaps[0] = '(')
  // 14: Выбрать слот 1 (между 1 и 2)
  // 15: Нажать '+' (gaps[1] = '+')
  // 16: Выбрать слот 2 (между 2 и 3)
  // 17: Нажать '+' (gaps[2] = '+')
  // 18: Выбрать слот 3 (между 3 и 4)
  // 19: Нажать '+' (gaps[3] = '+')
  // 20: Выбрать слот 4 (после 4)
  // 21: Нажать ')' (gaps[4] = ')')
  // 22: Нажать '*' (gaps[4] = ')*') -> (1+2+3+4) * 10 = 100!
  // 23: Финальный успех (кнопка "Понятно, играть!")

  const [step, setStep] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const ex1Digits = ['9', '8', '7', '6', '5', '4'];
  const ex2Digits = ['1', '2', '3', '4', '1', '0'];

  const isEx1 = step <= 10;
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
        return ['', '', '+', '', '', '', ''];
      case 5:
        return ['', '', '+', '-', '', '', ''];
      case 6:
        return ['', '', '+', '-', '', '', ''];
      case 7:
        return ['', '', '+', '-', '+', '', ''];
      case 8:
        return ['', '', '+', '-', '+', '', ''];
      case 9:
      case 10:
        return ['', '', '+', '-', '+', '-', '']; // 98 + 7 - 6 + 5 - 4 = 100

      case 11:
      case 12:
        return ['', '', '', '', '', '', ''];
      case 13:
        return ['(', '', '', '', '', '', ''];
      case 14:
        return ['(', '', '', '', '', '', ''];
      case 15:
        return ['(', '+', '', '', '', '', ''];
      case 16:
        return ['(', '+', '', '', '', '', ''];
      case 17:
        return ['(', '+', '+', '', '', '', ''];
      case 18:
        return ['(', '+', '+', '', '', '', ''];
      case 19:
        return ['(', '+', '+', '+', '', '', ''];
      case 20:
        return ['(', '+', '+', '+', '', '', ''];
      case 21:
        return ['(', '+', '+', '+', ')', '', ''];
      case 22:
      case 23:
        return ['(', '+', '+', '+', ')*', '', '']; // (1+2+3+4) * 10 = 100

      default:
        return ['', '', '', '', '', '', ''];
    }
  };

  const [gaps, setGaps] = useState<string[]>(getGapsForStep(0));

  useEffect(() => {
    setGaps(getGapsForStep(step));

    // Настройка активного слота
    if (step === 2 || step === 3) setSelectedSlot(2);
    else if (step === 4 || step === 5) setSelectedSlot(3);
    else if (step === 6 || step === 7) setSelectedSlot(4);
    else if (step === 8 || step === 9) setSelectedSlot(5);
    else if (step === 12 || step === 13) setSelectedSlot(0);
    else if (step === 14 || step === 15) setSelectedSlot(1);
    else if (step === 16 || step === 17) setSelectedSlot(2);
    else if (step === 18 || step === 19) setSelectedSlot(3);
    else if (step === 20 || step === 21 || step === 22) setSelectedSlot(4);
    else setSelectedSlot(null);

    // Эффект победы при решении примеров
    if (step === 10 || step === 23) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
        playSound('success');
        playVibration('success');
      } catch (e) {}
    }
  }, [step]);

  // Target element for pulsating cue
  const getCue = () => {
    // Пример 1
    if (step === 2) return { type: 'slot', idx: 2 };
    if (step === 3) return { type: 'op', op: '+' };
    if (step === 4) return { type: 'slot', idx: 3 };
    if (step === 5) return { type: 'op', op: '-' };
    if (step === 6) return { type: 'slot', idx: 4 };
    if (step === 7) return { type: 'op', op: '+' };
    if (step === 8) return { type: 'slot', idx: 5 };
    if (step === 9) return { type: 'op', op: '-' };

    // Пример 2
    if (step === 12) return { type: 'slot', idx: 0 };
    if (step === 13) return { type: 'op', op: '(' };
    if (step === 14) return { type: 'slot', idx: 1 };
    if (step === 15) return { type: 'op', op: '+' };
    if (step === 16) return { type: 'slot', idx: 2 };
    if (step === 17) return { type: 'op', op: '+' };
    if (step === 18) return { type: 'slot', idx: 3 };
    if (step === 19) return { type: 'op', op: '+' };
    if (step === 20) return { type: 'slot', idx: 4 };
    if (step === 21) return { type: 'op', op: ')' };
    if (step === 22) return { type: 'op', op: '*' };

    return null;
  };

  const cue = getCue();

  // Navigation handlers
  const handleNext = () => {
    playSound('click');
    playVibration('light');
    if (step < 23) {
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

    // Проверяем, соответствует ли клик требуемому слоту
    if (step === 2 && idx === 2) setStep(3);
    else if (step === 4 && idx === 3) setStep(5);
    else if (step === 6 && idx === 4) setStep(7);
    else if (step === 8 && idx === 5) setStep(9);
    else if (step === 12 && idx === 0) setStep(13);
    else if (step === 14 && idx === 1) setStep(15);
    else if (step === 16 && idx === 2) setStep(17);
    else if (step === 18 && idx === 3) setStep(19);
    else if (step === 20 && idx === 4) setStep(21);
  };

  // Operator click handler
  const handleOpClick = (op: string) => {
    playSound('click');
    playVibration('light');

    if (step === 3 && op === '+') setStep(4);
    else if (step === 5 && op === '-') setStep(6);
    else if (step === 7 && op === '+') setStep(8);
    else if (step === 9 && op === '-') setStep(10);
    else if (step === 13 && op === '(') setStep(14);
    else if (step === 15 && op === '+') setStep(16);
    else if (step === 17 && op === '+') setStep(18);
    else if (step === 19 && op === '+') setStep(20);
    else if (step === 21 && op === ')') setStep(22);
    else if (step === 22 && op === '*') setStep(23);
  };

  // Step info definitions
  const getStepInfo = () => {
    switch (step) {
      // Пример 1
      case 0:
        return {
          title: t?.tEx1Step0Title || 'Цель игры Make 100',
          desc: t?.tEx1Step0Desc || 'Расставьте математические знаки между цифрами, чтобы в итоге получилось ровно 100!',
          badge: t?.tutorialBadgeEx1Intro || 'Пример 1/2 • Введение',
          btnText: t?.tutorialStart || t?.tutorialNext || 'Начать ➡️',
        };
      case 1:
        return {
          title: t?.tEx1Step1Title || 'Секрет: склейка цифр',
          desc: t?.tEx1Step1Desc || 'Пустой слот между цифрами объединяет их в одно число! Первые цифры 9 и 8 образуют 98.',
          badge: t?.tutorialBadgeEx1Merge || 'Пример 1/2 • Склейка',
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 2:
        return {
          title: t?.tEx1Step2Title || 'Слот между 8 и 7',
          desc: t?.tEx1Step2Desc || 'Нажмите на кружок между 8 и 7, чтобы выбрать его.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '1'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 3:
        return {
          title: t?.tEx1Step3Title || 'Ставим знак +',
          desc: t?.tEx1Step3Desc || 'Теперь нажмите на кнопку «+» на клавиатуре внизу.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '2'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 4:
        return {
          title: t?.tEx1Step4Title || 'Слот между 7 и 6',
          desc: t?.tEx1Step4Desc || 'Отлично! Теперь нажмите на кружок между 7 и 6.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '3'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 5:
        return {
          title: t?.tEx1Step5Title || 'Ставим знак -',
          desc: t?.tEx1Step5Desc || 'Нажмите знак «-» на клавиатуре внизу.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '4'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 6:
        return {
          title: t?.tEx1Step6Title || 'Слот между 6 и 5',
          desc: t?.tEx1Step6Desc || 'Хорошо! Теперь выберите кружок между 6 и 5.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '5'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 7:
        return {
          title: t?.tEx1Step7Title || 'Ставим знак +',
          desc: t?.tEx1Step7Desc || 'Нажмите знак «+» на клавиатуре внизу.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '6'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 8:
        return {
          title: t?.tEx1Step8Title || 'Слот между 5 и 4',
          desc: t?.tEx1Step8Desc || 'Нажмите на последний кружок между 5 и 4.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '7'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 9:
        return {
          title: t?.tEx1Step9Title || 'Финальный знак -',
          desc: t?.tEx1Step9Desc || 'Нажмите знак «-» на клавиатуре: 98 + 7 - 6 + 5 - 4 = 100!',
          badge: t?.tutorialBadgeEx1Final || 'Пример 1/2 • Финал',
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 10:
        return {
          title: t?.tEx1SuccessTitle || '🎉 Браво! Первый пример решён!',
          desc: t?.tEx1SuccessDesc || 'Вы сами расставили все знаки и получили 100. Перейдём ко второму примеру со скобками!',
          badge: t?.tutorialBadgeEx1Win || 'Пример 1/2 • Победа!',
          btnText: t?.tutorialNextExample || 'Пример 2: Скобки ➡️',
        };

      // Пример 2
      case 11:
        return {
          title: t?.tEx2Step0Title || 'Пример 2: Скобки и умножение',
          desc: t?.tEx2Step0Desc || 'Умножение выполняется первым. Чтобы сначала сложить числа, используем скобки ( )!',
          badge: t?.tutorialBadgeEx2Intro || 'Пример 2/2 • Введение',
          btnText: t?.tutorialStart || t?.tutorialNext || 'Начать ➡️',
        };
      case 12:
        return {
          title: t?.tEx2Step1Title || 'Слот перед цифрой 1',
          desc: t?.tEx2Step1Desc || 'Нажмите на первый кружок перед цифрой 1.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '1'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 13:
        return {
          title: t?.tEx2Step2Title || 'Открываем скобку (',
          desc: t?.tEx2Step2Desc || 'Нажмите на скобку «(» на клавиатуре внизу.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '2'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 14:
        return {
          title: t?.tEx2Step3Title || 'Слот между 1 и 2',
          desc: t?.tEx2Step3Desc || 'Нажмите на кружок между 1 и 2.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '3'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 15:
        return {
          title: t?.tEx2Step4Title || 'Ставим знак +',
          desc: t?.tEx2Step4Desc || 'Нажмите «+» на клавиатуре.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '4'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 16:
        return {
          title: t?.tEx2Step5Title || 'Слот между 2 и 3',
          desc: t?.tEx2Step5Desc || 'Нажмите на кружок между 2 и 3.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '5'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 17:
        return {
          title: t?.tEx2Step6Title || 'Ставим знак +',
          desc: t?.tEx2Step6Desc || 'Нажмите «+» на клавиатуре.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '6'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 18:
        return {
          title: t?.tEx2Step7Title || 'Слот между 3 и 4',
          desc: t?.tEx2Step7Desc || 'Нажмите на кружок между 3 и 4.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '7'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 19:
        return {
          title: t?.tEx2Step8Title || 'Ставим знак +',
          desc: t?.tEx2Step8Desc || 'Нажмите «+». Внутри скобок получилось: 1 + 2 + 3 + 4 = 10!',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '8'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 20:
        return {
          title: t?.tEx2Step9Title || 'Слот после цифры 4',
          desc: t?.tEx2Step9Desc || 'Нажмите на кружок после цифры 4, чтобы закрыть скобку.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '9'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 21:
        return {
          title: t?.tEx2Step10Title || 'Закрываем скобку )',
          desc: t?.tEx2Step10Desc || 'Нажмите скобку «)» на клавиатуре.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '10'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 22:
        return {
          title: t?.tEx2Step11Title || 'Умножаем *',
          desc: t?.tEx2Step11Desc || 'В этот же слот нажмите знак «*», чтобы умножить сумму скобок!',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '11'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 23:
        return {
          title: t?.tEx2SuccessTitle || '🏆 Великолепно! Вы освоили Make 100!',
          desc: t?.tEx2SuccessDesc || 'Теперь вы умеете объединять цифры, ставить знаки и применять скобки. Приятной игры!',
          badge: t?.tutorialBadgeEx2Win || 'Пример 2/2 • Победа!',
          btnText: t?.tutorialFinish || 'Понятно, играть!',
        };
      default:
        return {
          title: t?.howToPlayTutorial || 'Обучение Make 100',
          desc: '',
          badge: '',
          btnText: t?.tutorialNext || 'Далее',
        };
    }
  };

  const stepInfo = getStepInfo();

  // Dynamic result calculation
  const getResultDisplay = () => {
    if (step >= 9 && step <= 10) return '= 100';
    if (step >= 22) return '= 100';
    if (step === 3 || step === 4) return '= 98 + 7...';
    if (step === 5 || step === 6) return '= 98 + 7 - 6...';
    if (step === 7 || step === 8) return '= 98 + 7 - 6 + 5...';
    if (step === 19 || step === 20) return '= (10)...';
    if (step === 21) return '= (10) * ?';
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
            <span>{t?.tutorialSkip || 'Пропустить'}</span>
            <CloseIcon size={14} />
          </button>
        </header>

        {/* Step Instruction Card (Гарантированно отображает текст) */}
        <div className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 mb-2 relative overflow-hidden transition-all duration-300">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-orange-500/30">
              {step === 10 || step === 23 ? <CheckCircle2 size={20} /> : <Sparkles size={18} />}
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
                <span>{t?.tutorialPrev || '⬅️ Назад'}</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              className={`flex items-center gap-1 text-xs sm:text-sm font-black py-2 px-4 rounded-xl transition-all shadow-md cursor-pointer ${
                step === 10 || step === 23
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
                  👇 {t?.tutorialPressHere || 'Нажми сюда!'}
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
              const isHighlightDigits = (step === 1 && (idx === 0 || idx === 1)) || (step === 22 && (idx === 4 || idx === 5));

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
                        👇 {t?.tutorialPressHere || 'Нажми сюда!'}
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
                step === 9 || step === 10 || step >= 22
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
                    👆 {t?.tutorialPressHere || 'Нажми сюда!'}
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
