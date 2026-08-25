import React from 'react';
import './LicensePlate.css';

interface LicensePlateProps {
  ticketDigits: string[];
  letters?: string[]; // Буквы номера (опционально)
}

/**
 * Компонент 3D Автомобильного Номера (License Plate).
 * Рендерит реалистичный российский номер с кодом региона (777) и флагом.
 * Внутри номера отображаются 6 цифр текущего билета (вместо стандартного формата букв/цифр).
 */
export const LicensePlate: React.FC<LicensePlateProps> = ({ ticketDigits }) => {
  // Для красивого отображения разбиваем цифры на блоки:
  // Формат реального номера: [Буква] [3 цифры] [2 Буквы], но у нас 6 цифр билета.
  // Мы просто отобразим 6 цифр с небольшими отступами.
  const firstBlock = ticketDigits.slice(0, 3).join('');
  const secondBlock = ticketDigits.slice(3, 6).join('');

  return (
    <div className="license-plate-container">
      <div className="license-plate-3d">
        <div className="license-plate-inner">
          {/* Левая часть - основной номер (6 цифр билета) */}
          <div className="license-plate-main">
            <span className="plate-digits">{firstBlock}</span>
            <span className="plate-spacer">-</span>
            <span className="plate-digits">{secondBlock}</span>
          </div>

          {/* Вертикальный разделитель */}
          <div className="license-plate-divider"></div>

          {/* Правая часть - Код региона и страна */}
          <div className="license-plate-region">
            <div className="region-code">777</div>
            <div className="country-info">
              <span className="country-code">RUS</span>
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/320px-Flag_of_Russia.svg.png" 
                alt="RU Flag" 
                className="country-flag" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
