const fs = require('fs');

const databasePath = 'c:/Users/CW/Desktop/drugcheck/data/database.ts';

let content = fs.readFileSync(databasePath, 'utf8');

// Fix specific apostrophe issues
content = content.replace(/clonidines antihypertensive/g, "clonidine\\'s antihypertensive");
content = content.replace(/dont avoid/g, "don\\'t avoid");

fs.writeFileSync(databasePath, content, 'utf8');

console.log('Fixed specific apostrophe issues');
