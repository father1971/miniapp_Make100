const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<TicketCard \n        digits={digits} \n        category={ticketBg?.category} \n        categoryName={ticketBg?.categoryName} \n      />',
  '<TicketCard \n        digits={digits} \n        category={ticketBg?.category} \n        categoryName={ticketBg?.categoryName} \n        t={t}\n      />'
);
// Also search if it's written differently
content = content.replace(
  /<TicketCard[\s\S]*?categoryName={ticketBg\?\.categoryName}[\s\S]*?\/>/,
  `<TicketCard 
        digits={digits} 
        category={ticketBg?.category} 
        categoryName={ticketBg?.categoryName} 
        t={t}
      />`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
