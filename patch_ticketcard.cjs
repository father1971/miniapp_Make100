const fs = require('fs');

let content = fs.readFileSync('src/components/TicketCard.tsx', 'utf8');

// We need to add `t?: any;` to TicketCardProps
content = content.replace('export interface TicketCardProps {', 'export interface TicketCardProps {\n  t?: any;');

// Add titleKey and descKey to ThemeDef instead of badgeLeft and badgeRight
content = content.replace('  badgeLeft: string;\n  badgeRight: string;', '  titleKey: string;\n  descKey: string;');

// Replace THEMES object properties
const replacements = [
  { oldLeft: "'ТЕАТРАЛЬНЫЙ БИЛЕТ'", oldRight: "'ПАРТЕР • РЯД 3 • ЛОЖА №5'", keyTitle: "'ticketTheatreTitle'", keyDesc: "'ticketTheatreDesc'" },
  { oldLeft: "'БИЛЕТ НА АВТОБУС'", oldRight: "'ЦЕНА 6 КОП.'", keyTitle: "'ticketBusTitle'", keyDesc: "'ticketBusDesc'" },
  { oldLeft: "'FLIGHT SU-100'", oldRight: "'SVO ✈ DXB • GATE B22'", keyTitle: "'ticketFlightTitle'", keyDesc: "'ticketFlightDesc'" },
  { oldLeft: "'Ж/Д БИЛЕТ'", oldRight: "'МЕЖДУГОРОДНИЙ КУПОН'", keyTitle: "'ticketTrainTitle'", keyDesc: "'ticketTrainDesc'" },
  { oldLeft: "'CONCERT PASS'", oldRight: "'FAN ZONE • ACCESS ALL AREAS'", keyTitle: "'ticketConcertTitle'", keyDesc: "'ticketConcertDesc'" },
  { oldLeft: "'STADIUM TICKET'", oldRight: "'MATCH DAY • SECTOR C • ROW 12'", keyTitle: "'ticketStadiumTitle'", keyDesc: "'ticketStadiumDesc'" },
  { oldLeft: "'БИЛЕТ В КИНО'", oldRight: "'ADMIT ONE • СЕАНС 20:00'", keyTitle: "'ticketCinemaTitle'", keyDesc: "'ticketCinemaDesc'" },
  { oldLeft: "'AMUSEMENT PARK'", oldRight: "'★ UNLIMITED RIDES ★'", keyTitle: "'ticketAmusementTitle'", keyDesc: "'ticketAmusementDesc'" },
  { oldLeft: "'EXHIBITION PASS'", oldRight: "'GENERAL ADMISSION'", keyTitle: "'ticketMuseumTitle'", keyDesc: "'ticketMuseumDesc'" },
  { oldLeft: "'ЛОТЕРЕЯ'", oldRight: "'СЧАСТЛИВЫЙ БИЛЕТ • JACKPOT'", keyTitle: "'ticketLotteryTitle'", keyDesc: "'ticketLotteryDesc'" },
];

for (const rep of replacements) {
  content = content.replace(`badgeLeft: ${rep.oldLeft}`, `titleKey: ${rep.keyTitle}`);
  content = content.replace(`badgeRight: ${rep.oldRight}`, `descKey: ${rep.keyDesc}`);
}

// Now replace destructuring in TicketCard component
content = content.replace("({ digits, category = 'cinema', categoryName }) => {", "({ digits, category = 'cinema', categoryName, t }) => {");

// Now replace usage of badgeLeft and badgeRight in JSX
content = content.replace("{categoryName || theme.badgeLeft}", "{categoryName || (t ? t[theme.titleKey as keyof typeof t] : '')}");
content = content.replace("{theme.badgeRight}", "{t ? t[theme.descKey as keyof typeof t] : ''}");
content = content.replace("КОНТРОЛЬ", "{t?.ticketControl || 'КОНТРОЛЬ'}");


fs.writeFileSync('src/components/TicketCard.tsx', content, 'utf8');
console.log('TicketCard updated.');
