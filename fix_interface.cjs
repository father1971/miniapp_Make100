const fs = require('fs');

let content = fs.readFileSync('src/translations.ts', 'utf8');

// The messed up lines are:
//    flight: { title: string; subtitle: string; footerLeft: string; footerRight: string   ticketTheatreTitle: string;
//  ticketTheatreDesc: string;
// ...
//  ticketControl: string;

// I will just remove these newly added lines from that spot.
const newKeys = [
  'ticketTheatreTitle', 'ticketTheatreDesc', 'ticketBusTitle', 'ticketBusDesc', 'ticketFlightTitle', 'ticketFlightDesc',
  'ticketTrainTitle', 'ticketTrainDesc', 'ticketConcertTitle', 'ticketConcertDesc', 'ticketStadiumTitle', 'ticketStadiumDesc',
  'ticketCinemaTitle', 'ticketCinemaDesc', 'ticketAmusementTitle', 'ticketAmusementDesc', 'ticketMuseumTitle', 'ticketMuseumDesc',
  'ticketLotteryTitle', 'ticketLotteryDesc', 'ticketControl'
];

for (const key of newKeys) {
  content = content.replace(`  ${key}: string;\n`, '');
  content = content.replace(`   ${key}: string;\n`, '');
}

// Restore flight object if needed (wait, I replaced the '}' so it's missing)
// It originally was `footerRight: string; };` or something
content = content.replace('footerRight: string   ticketTheatreTitle: string;', 'footerRight: string; };');
content = content.replace('footerRight: string;', 'footerRight: string; };'); // just in case

// Now let's find the correct end of TranslationData interface
// It ends right before `export const TRANSLATIONS`
const transIndex = content.indexOf('export const TRANSLATIONS');
let beforeTrans = content.substring(0, transIndex);
const afterTrans = content.substring(transIndex);

// beforeTrans should end with `}\n\n`
const lastBrace = beforeTrans.lastIndexOf('}');
if (lastBrace !== -1) {
  let fieldsToAdd = '';
  for (const key of newKeys) {
    fieldsToAdd += `  ${key}: string;\n`;
  }
  beforeTrans = beforeTrans.substring(0, lastBrace) + fieldsToAdd + beforeTrans.substring(lastBrace);
}

fs.writeFileSync('src/translations.ts', beforeTrans + afterTrans, 'utf8');
console.log('Fixed interface.');
