const fs = require('fs');

const databasePath = 'c:/Users/CW/Desktop/drugcheck/data/database.ts';

let content = fs.readFileSync(databasePath, 'utf8');

// Fix St. John's Wort apostrophe
content = content.replace(/St\. John\\'s Wort/g, "St. John\\\\'s Wort");

fs.writeFileSync(databasePath, content, 'utf8');

console.log("Fixed St. John's Wort apostrophes");
