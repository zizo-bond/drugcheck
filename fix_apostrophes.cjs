const fs = require('fs');

const databasePath = 'c:/Users/CW/Desktop/drugcheck/data/database.ts';

let content = fs.readFileSync(databasePath, 'utf8');

// Count occurrences before fixing
const beforeCount = (content.match(/'/g) || []).length;

// Fix all single quotes within string literals by escaping them
// We need to find patterns like: 'text with ' in it'
// Strategy: Replace ' with \' but only when it's inside a string (between two single quotes)

// More robust approach: find all add() function calls and fix apostrophes in their string arguments
const addPattern = /add\([^)]+\)/g;
let fixedCount = 0;

content = content.replace(addPattern, (match) => {
    // Check if this match contains unescaped apostrophes
    if (match.includes("'s ") || match.includes("'t ") || match.includes("'re ") || match.includes("'ll ") || match.includes("'ve ") || match.includes("'d ")) {
        fixedCount++;
        // Replace unescaped apostrophes with escaped ones
        // We need to be careful not to escape the string delimiters
        return match
            .replace(/nitroglycerin's/g, "nitroglycerin\\'s")
            .replace(/other's/g, "other\\'s")
            .replace(/patient's/g, "patient\\'s")
            .replace(/drug's/g, "drug\\'s")
            .replace(/body's/g, "body\\'s")
            .replace(/liver's/g, "liver\\'s")
            .replace(/heart's/g, "heart\\'s")
            .replace(/kidney's/g, "kidney\\'s")
            .replace(/brain's/g, "brain\\'s")
            .replace(/blood's/g, "blood\\'s")
            .replace(/system's/g, "system\\'s")
            .replace(/enzyme's/g, "enzyme\\'s")
            .replace(/receptor's/g, "receptor\\'s")
            .replace(/cell's/g, "cell\\'s")
            .replace(/tissue's/g, "tissue\\'s")
            .replace(/organ's/g, "organ\\'s")
            .replace(/metabolism's/g, "metabolism\\'s")
            .replace(/action's/g, "action\\'s")
            .replace(/effect's/g, "effect\\'s")
            .replace(/mechanism's/g, "mechanism\\'s")
            .replace(/interaction's/g, "interaction\\'s")
            .replace(/response's/g, "response\\'s")
            .replace(/function's/g, "function\\'s")
            .replace(/activity's/g, "activity\\'s")
            .replace(/level's/g, "level\\'s")
            .replace(/concentration's/g, "concentration\\'s")
            .replace(/clearance's/g, "clearance\\'s")
            .replace(/absorption's/g, "absorption\\'s")
            .replace(/distribution's/g, "distribution\\'s")
            .replace(/excretion's/g, "excretion\\'s")
            .replace(/elimination's/g, "elimination\\'s");
    }
    return match;
});

fs.writeFileSync(databasePath, content, 'utf8');

console.log(`Fixed ${fixedCount} add() calls with apostrophe issues`);
