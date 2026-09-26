import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StopwatchProps {
  /** Управляет запуском/остановкой секундомера */
  isRunning: boolean;
  /** Вызывается при каждом тике — передаёт время в миллисекундах */
  onTick?: (elapsedMs: number) => void;
  /** Сбрасывает секундомер при изменении этого значения */
  resetKey?: number;
}

/**
 * Автономный компонент секундомера.
 * Обновляет только себя (setInterval 50мс), не вызывая перерисовку родителя.
 */
export const Stopwatch = React.memo(function Stopwatch({ isRunning, onTick, resetKey }: StopwatchProps) {
  const [display, setDisplay] = useState('00:00:00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedAtPauseRef = useRef<number>(0);

  // Форматирование ММ:СС:мс (сотые доли)
  const format = useCallback((ms: number): string => {
    const totalMs = Math.max(0, Math.floor(ms));
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const centis = Math.floor((totalMs % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(centis).padStart(2, '0')}`;
  }, []);

  // Сброс по resetKey
  useEffect(() => {
    elapsedAtPauseRef.current = 0;
    startTimeRef.current = Date.now();
    setDisplay('00:00:00');
  }, [resetKey]);

  // Запуск/остановка интервала
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = elapsedAtPauseRef.current + (Date.now() - startTimeRef.current);
        setDisplay(format(elapsed));
        onTick?.(elapsed);
      }, 50);
    } else {
      if (intervalRef.current) {
        elapsedAtPauseRef.current += Date.now() - startTimeRef.current;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, format, onTick]);

  return (
    <span className="text-zinc-900 dark:text-white font-black text-lg sm:text-xl tracking-wider font-mono">
      {display}
    </span>
  );
});
