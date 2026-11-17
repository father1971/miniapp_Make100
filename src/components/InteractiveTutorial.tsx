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
        return ['(', '+', '+', '+', ')*', '', '']; // (1+2+3+4)*10 = 100
      default:
        return ['', '', '', '', '', '', ''];
    }
  };

  const gaps = getGapsForStep(step);

  // Selected slot depending on step
  const getSelectedSlotForStep = (s: number): number | null => {
    switch (s) {
      case 2:
      case 3:
        return 2;
      case 4:
      case 5:
        return 3;
      case 6:
      case 7:
        return 4;
      case 8:
      case 9:
        return 5;
      case 12:
      case 13:
        return 0;
      case 14:
      case 15:
        return 1;
      case 16:
      case 17:
        return 2;
      case 18:
      case 19:
        return 3;
      case 20:
      case 21:
      case 22:
        return 4;
      default:
        return null;
    }
  };

  const selectedSlot = getSelectedSlotForStep(step);

  // Cue (target action): slot or operator
  const getCue = (): { type: 'slot' | 'op' | 'btn'; idx?: number; op?: string } | null => {
    switch (step) {
      case 0:
      case 1:
        return { type: 'btn' };
      case 2:
        return { type: 'slot', idx: 2 };
      case 3:
        return { type: 'op', op: '+' };
      case 4:
        return { type: 'slot', idx: 3 };
      case 5:
        return { type: 'op', op: '-' };
      case 6:
        return { type: 'slot', idx: 4 };
      case 7:
        return { type: 'op', op: '+' };
      case 8:
        return { type: 'slot', idx: 5 };
      case 9:
        return { type: 'op', op: '-' };
      case 10:
        return { type: 'btn' };

      case 11:
        return { type: 'btn' };
      case 12:
        return { type: 'slot', idx: 0 };
      case 13:
        return { type: 'op', op: '(' };
      case 14:
        return { type: 'slot', idx: 1 };
      case 15:
        return { type: 'op', op: '+' };
      case 16:
        return { type: 'slot', idx: 2 };
      case 17:
        return { type: 'op', op: '+' };
      case 18:
        return { type: 'slot', idx: 3 };
      case 19:
        return { type: 'op', op: '+' };
      case 20:
        return { type: 'slot', idx: 4 };
      case 21:
        return { type: 'op', op: ')' };
      case 22:
        return { type: 'op', op: '*' };
      case 23:
        return { type: 'btn' };
      default:
        return null;
    }
  };

  const cue = getCue();

  // Trigger confetti on win steps
  useEffect(() => {
    if (step === 9 || step === 10 || step === 22 || step === 23) {
      playSound('success');
      playVibration('success');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [step]);

  // Handle slot click
  const handleSlotClick = (slotIdx: number) => {
    if (cue?.type === 'slot' && cue.idx === slotIdx) {
      playSound('click');
      playVibration('light');
      setStep(s => s + 1);
    } else {
      playVibration('error');
    }
  };

  // Handle operator click
  const handleOpClick = (op: string) => {
    if (cue?.type === 'op' && cue.op === op) {
      playSound('click');
      playVibration('medium');
      setStep(s => s + 1);
    } else {
      playVibration('error');
    }
  };

  // Handle next button
  const handleNext = () => {
    playSound('click');
    playVibration('light');
    if (step === 10) {
      setStep(11); // Переход ко 2 примеру
    } else if (step === 23) {
      onComplete(); // Окончание туториала
    } else if (step === 0 || step === 1 || step === 11) {
      setStep(s => s + 1);
    } else {
      setStep(s => s + 1);
    }
  };

  // Handle prev button
  const handlePrev = () => {
    if (step > 0) {
      playSound('click');
      playVibration('light');
      setStep(s => s - 1);
    }
  };

  // Localized title & descriptions for each step
  const getStepInfo = () => {
    switch (step) {
      // --- ПРИМЕР 1 ---
      case 0:
        return {
          title: t?.tEx1Step0Title || '🎯 Цель игры — получить ровно 100!',
          desc: t?.tEx1Step0Desc || 'Перед вами билет с шестью цифрами: 9 8 7 6 5 4. Ваша задача — расставить математические знаки так, чтобы получилось ровно 100.',
          badge: (t?.tutorialBadgeEx1Intro || 'Пример 1/2 • Введение'),
          btnText: t?.tutorialStart || 'Начать ➡️',
        };
      case 1:
        return {
          title: t?.tEx1Step1Title || '💡 Секрет склеивания цифр',
          desc: t?.tEx1Step1Desc || 'Если оставить промежуток между цифрами пустым, они объединяются в одно число! Первые цифры 9 и 8 дают 98.',
          badge: (t?.tutorialBadgeEx1Merge || 'Пример 1/2 • Склейка'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 2:
        return {
          title: t?.tEx1Step2Title || 'Выберите слот между 8 и 7',
          desc: t?.tEx1Step2Desc || 'Нажмите на подсвеченный кружок между цифрами 8 и 7, чтобы вставить знак.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '1'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 3:
        return {
          title: t?.tEx1Step3Title || 'Поставьте знак +',
          desc: t?.tEx1Step3Desc || 'Нажмите на кнопку «+» на клавиатуре внизу. Теперь у нас: 98 + 7 = 105!',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '2'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 4:
        return {
          title: t?.tEx1Step4Title || 'Выберите слот между 7 и 6',
          desc: t?.tEx1Step4Desc || 'Нажмите на подсвеченный кружок между 7 и 6.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '3'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 5:
        return {
          title: t?.tEx1Step5Title || 'Поставьте знак -',
          desc: t?.tEx1Step5Desc || 'Нажмите «-» на клавиатуре. Получаем: 105 - 6 = 99!',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '4'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 6:
        return {
          title: t?.tEx1Step6Title || 'Выберите слот между 6 и 5',
          desc: t?.tEx1Step6Desc || 'Нажмите на подсвеченный кружок между 6 и 5.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '5'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 7:
        return {
          title: t?.tEx1Step7Title || 'Поставьте знак +',
          desc: t?.tEx1Step7Desc || 'Нажмите «+» на клавиатуре. 99 + 5 = 104!',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '6'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 8:
        return {
          title: t?.tEx1Step8Title || 'Последний слот: между 5 и 4',
          desc: t?.tEx1Step8Desc || 'Нажмите на кружок между 5 и 4.',
          badge: (t?.tutorialBadgeEx1Step || 'Пример 1/2 • Шаг {step}').replace('{step}', '7'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 9:
        return {
          title: t?.tEx1Step9Title || 'Финальный знак -',
          desc: t?.tEx1Step9Desc || 'Нажмите «-» на клавиатуре. 104 - 4 = ровно 100!',
          badge: (t?.tutorialBadgeEx1Final || 'Пример 1/2 • Финал'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 10:
        return {
          title: t?.tEx1SuccessTitle || '🎉 Отлично! 98 + 7 - 6 + 5 - 4 = 100!',
          desc: t?.tEx1SuccessDesc || 'Вы успешно решили первый пример! Теперь давайте научимся использовать скобки.',
          badge: t?.tutorialBadgeEx1Win || 'Пример 1/2 • Победа!',
          btnText: t?.tutorialNextExample || 'Пример 2: Скобки ➡️',
        };

      // --- ПРИМЕР 2 ---
      case 11:
        return {
          title: t?.tEx2Step0Title || 'Пример 2: Магия скобок ( )',
          desc: t?.tEx2Step0Desc || 'Перед вами цифры: 1 2 3 4 1 0. Сложим первые четыре цифры в скобках (1+2+3+4 = 10) и умножим на 10!',
          badge: t?.tutorialBadgeEx2Intro || 'Пример 2/2 • Введение',
          btnText: t?.tutorialStart || 'Начать ➡️',
        };
      case 12:
        return {
          title: t?.tEx2Step1Title || 'Слот ПЕРЕД первой цифрой',
          desc: t?.tEx2Step1Desc || 'Скобку можно открыть в самом начале выражения! Нажмите на кружок перед цифрой 1.',
          badge: (t?.tutorialBadgeEx2Step || 'Пример 2/2 • Шаг {step}').replace('{step}', '1'),
          btnText: t?.tutorialNext || 'Далее ➡️',
        };
      case 13:
        return {
          title: t?.tEx2Step2Title || 'Открываем скобку (',
          desc: t?.tEx2Step2Desc || 'Нажмите на открывающую скобку «(» на клавиатуре.',
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
          btnText: t?.tutorialNext || 'Далее ➡️',
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

  // Helper for dynamic Gap width exactly matching the new main game interface
  const renderGapButton = (slotIdx: number) => {
    const value = gaps[slotIdx] || '';
    const isSelected = selectedSlot === slotIdx;
    const isTarget = cue?.type === 'slot' && cue.idx === slotIdx;
    const charCount = value.length;

    // Адаптивная ширина слота: базовая + расширение под каждый введенный символ
    const baseWidthRem = 1.35;
    const baseWidthVw = 5.8;
    const baseWidthMaxRem = 2.15;
    const extraWidthPerCharRem = 0.55;
    const extraWidthPerCharVw = 2.2;
    const extraWidthPerCharMaxRem = 0.9;
    const extraChars = Math.max(0, charCount - 1);
    const dynamicWidth = `clamp(${baseWidthRem + (extraChars * extraWidthPerCharRem)}rem, ${baseWidthVw + (extraChars * extraWidthPerCharVw)}vw, ${baseWidthMaxRem + (extraChars * extraWidthPerCharMaxRem)}rem)`;

    return (
      <div className="relative flex-shrink-0" key={slotIdx}>
        {isTarget && (
          <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-md z-30">
            👇 {t?.tutorialPressHere || 'Нажми сюда!'}
          </div>
        )}
        <button
          onClick={() => handleSlotClick(slotIdx)}
          style={{ width: dynamicWidth }}
          aria-label={`Слот ${slotIdx + 1}: ${value || 'пусто'}`}
          className={`relative h-[clamp(2.35rem,9.8vw,3.35rem)] rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all duration-200 outline-none font-black flex-shrink-0 cursor-pointer touch-manipulation select-none before:absolute before:-inset-1.5 before:content-[''] ${
            isTarget
              ? 'border-orange-500 bg-orange-500/30 text-orange-600 scale-105 ring-4 ring-orange-500/35 animate-pulse z-20'
              : isSelected
              ? 'border-orange-500 bg-orange-500/25 dark:bg-orange-500/35 text-orange-600 dark:text-orange-400 backdrop-blur-md shadow-[0_0_0_4px_rgba(249,115,22,0.2)] scale-105 z-20'
              : value
              ? 'border-zinc-800/80 dark:border-zinc-200/80 bg-zinc-800/70 dark:bg-zinc-200/80 text-white dark:text-zinc-900 backdrop-blur-md shadow-sm z-10'
              : 'border-dashed border-zinc-400/70 dark:border-zinc-500/60 hover:border-orange-400 text-zinc-400 dark:text-zinc-500 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-md z-10'
          }`}
        >
          {value ? (
            <span className="text-[clamp(1.15rem,4.8vw,1.6rem)] whitespace-nowrap px-0.5 leading-none">{value}</span>
          ) : (
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-400 dark:bg-zinc-600"></span>
          )}
        </button>
      </div>
    );
  };

  return (
    <motion.div
      key="interactive-tutorial"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] text-zinc-900 dark:text-white flex flex-col items-center justify-between select-none overflow-y-auto overflow-x-hidden"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top, env(safe-area-inset-top, 0px)) + 8px)',
        paddingBottom: 'calc(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) + 12px)',
      }}
    >
      {/* Затемняющий полупрозрачный слой матового стекла, сквозь который красиво просвечивает реальный фон игры */}
      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md pointer-events-none -z-10" />

      <div className="relative z-10 w-full max-w-md sm:max-w-lg md:max-w-xl flex flex-col justify-between items-center h-full px-2 sm:px-4">
        {/* Top Header */}
        <header className="w-full flex items-center justify-between gap-2 py-1 mb-1">
          <div className="flex items-center gap-1.5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 text-orange-600 dark:text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide shadow-md">
            <Sparkles size={14} className="animate-spin-slow text-orange-500" />
            <span>{stepInfo.badge}</span>
          </div>

          {/* Skip Button */}
          <button
            onClick={() => {
              playSound('click');
              playVibration('light');
              onComplete();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 py-1.5 px-3.5 rounded-full transition-all cursor-pointer shadow-md active:scale-95"
          >
            <span>{t?.tutorialSkip || 'Пропустить'}</span>
            <CloseIcon size={14} />
          </button>
        </header>

        {/* Step Instruction Card: Полупрозрачное матовое стекло 1 в 1 с дизайном игры */}
        <div className="w-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl rounded-2xl sm:rounded-[1.75rem] p-3 sm:p-4 shadow-xl border border-white/40 dark:border-white/10 mb-2 relative overflow-hidden transition-all duration-300">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-orange-500/30">
              {step === 10 || step === 23 ? <CheckCircle2 size={22} /> : <Sparkles size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                {stepInfo.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 mt-1 leading-relaxed">
                {stepInfo.desc}
              </p>
            </div>
          </div>

          {/* Action buttons (Prev / Next) с просторным местом под надписи */}
          <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-zinc-300/40 dark:border-zinc-800/60">
            {step > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 py-2.5 px-4 rounded-xl sm:rounded-2xl bg-white/40 dark:bg-zinc-900/40 border border-white/30 dark:border-white/10 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <ChevronLeft size={16} />
                <span>{t?.tutorialPrev || '⬅️ Назад'}</span>
              </button>
            ) : <div />}

            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-black py-2.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 ${
                step === 10 || step === 23
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 animate-pulse'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25'
              }`}
            >
              <span className="whitespace-nowrap">{stepInfo.btnText}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Real Ticket Card Display (В точном масштабе нового интерфейса) */}
        <div className="w-full flex-1 flex items-center justify-center py-1 sm:py-2">
          <div className="w-full max-w-sm transform scale-95 sm:scale-100 transition-all duration-300">
            <TicketCard
              digits={currentDigits}
              category={isEx1 ? 'vintage-tram' : 'theatre'}
              t={t}
            />
          </div>
        </div>

        {/* Expression Builder: В точности как на новом основном экране игры (полупрозрачное матовое стекло) */}
        <div className="w-full py-2.5 sm:py-3.5 px-1 sm:px-3 rounded-2xl sm:rounded-[1.75rem] shadow-xl mb-2 sm:mb-2.5 transition-colors flex flex-col items-center overflow-hidden bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10">
          <div className="flex flex-nowrap justify-center items-center gap-x-[clamp(0.12rem,0.6vw,0.4rem)] text-[clamp(1.85rem,7.8vw,2.85rem)] font-mono font-black py-0.5 sm:py-1 w-full text-zinc-900 dark:text-white">
            {/* Slot 0 (Перед 1-й цифрой) */}
            {renderGapButton(0)}

            {/* Цифры и слоты 1..6 */}
            {currentDigits.map((digit, idx) => {
              const slotIdx = idx + 1;
              const isHighlightDigits = (step === 1 && (idx === 0 || idx === 1)) || (step === 22 && (idx === 4 || idx === 5));

              return (
                <React.Fragment key={idx}>
                  <span
                    className={`drop-shadow-sm select-none flex-shrink-0 leading-none transition-all duration-300 ${
                      isHighlightDigits
                        ? 'text-orange-500 scale-110 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)] font-black'
                        : 'text-zinc-800 dark:text-zinc-100 opacity-100 scale-100'
                    }`}
                  >
                    {digit}
                  </span>

                  {renderGapButton(slotIdx)}
                </React.Fragment>
              );
            })}
          </div>

          {/* Dynamic Result Display */}
          <div className="h-7 sm:h-8 mt-1 flex items-center justify-center w-full">
            <span
              className={`font-mono text-xl sm:text-2xl font-black tracking-wider transition-all duration-300 ${
                step === 9 || step === 10 || step >= 22
                  ? 'text-emerald-500 scale-110 animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'text-zinc-700 dark:text-zinc-300 font-bold'
              }`}
            >
              {getResultDisplay()}
            </span>
          </div>
        </div>

        {/* Real Keypad Display: Точная копия новой клавиатуры 4x2 с сочным оранжевым контрастом и матовым стеклом */}
        <div className="w-full p-1.5 sm:p-2.5 rounded-2xl sm:rounded-[1.75rem] bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-lg mb-1">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { op: '+', label: '+', icon: <Plus size={24} strokeWidth={3.5} />, isOp: true },
              { op: '-', label: '-', icon: <Minus size={24} strokeWidth={3.5} />, isOp: true },
              { op: '*', label: '*', icon: <X size={24} strokeWidth={3.5} />, isOp: true },
              { op: '/', label: '/', icon: <Divide size={24} strokeWidth={3.5} />, isOp: true },
              { op: '(', label: '(', icon: <span className="text-xl font-black">(</span> },
              { op: ')', label: ')', icon: <span className="text-xl font-black">)</span> },
              { op: ',', label: ',', icon: <span className="text-xl font-black">,</span> },
              { op: '⌫', label: '⌫', icon: <Delete size={22} strokeWidth={2.5} />, isDanger: true },
            ].map(item => {
              const isTargetOp = cue?.type === 'op' && cue.op === item.op;

              return (
                <div key={item.op} className="relative">
                  {isTargetOp && (
                    <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full whitespace-nowrap animate-bounce shadow-md z-30">
                      👆 {t?.tutorialPressHere || 'Нажми сюда!'}
                    </div>
                  )}
                  <button
                    onClick={() => handleOpClick(item.op)}
                    aria-label={item.label}
                    className={`flex items-center justify-center w-full h-11 sm:h-12 md:h-14 rounded-xl sm:rounded-2xl font-black transition-all border-2 select-none backdrop-blur-md active:scale-95 cursor-pointer shadow-md touch-manipulation ${
                      isTargetOp
                        ? 'border-orange-500 bg-orange-500 text-white scale-105 ring-4 ring-orange-500/40 animate-pulse z-20 shadow-orange-500/40 text-2xl'
                        : item.isDanger
                        ? 'bg-red-500/70 hover:bg-red-500/85 text-white border-red-400/80 dark:border-red-400/70 shadow-red-500/20'
                        : item.isOp
                        ? 'bg-orange-500/70 hover:bg-orange-500/85 text-white border-orange-400/80 dark:border-orange-400/70 shadow-orange-500/20 text-2xl'
                        : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white border-white/40 dark:border-white/15 hover:bg-white/70 dark:hover:bg-zinc-700/60 shadow-sm text-xl'
                    }`}
                  >
                    {item.icon}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
