const fs = require('fs');

const databasePath = 'c:/Users/CW/Desktop/drugcheck/data/database.ts';

let content = fs.readFileSync(databasePath, 'utf8');

// Fix double-escaped apostrophes
content = content.replace(/don\\\\'t/g, "don't");
content = content.replace(/can\\\\'t/g, "can't");
content = content.replace(/won\\\\'t/g, "won't");
content = content.replace(/isn\\\\'t/g, "isn't");
content = content.replace(/aren\\\\'t/g, "aren't");
content = content.replace(/wasn\\\\'t/g, "wasn't");
content = content.replace(/weren\\\\'t/g, "weren't");
content = content.replace(/hasn\\\\'t/g, "hasn't");
content = content.replace(/haven\\\\'t/g, "haven't");
content = content.replace(/hadn\\\\'t/g, "hadn't");
content = content.replace(/doesn\\\\'t/g, "doesn't");
content = content.replace(/didn\\\\'t/g, "didn't");
content = content.replace(/shouldn\\\\'t/g, "shouldn't");
content = content.replace(/wouldn\\\\'t/g, "wouldn't");
content = content.replace(/couldn\\\\'t/g, "couldn't");

fs.writeFileSync(databasePath, content, 'utf8');

console.log('Fixed double-escaped apostrophes');
