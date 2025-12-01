const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'database.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

const addFuncEndIndex = fileContent.indexOf('};', fileContent.indexOf('const add =')) + 2;
const footerStartIndex = fileContent.indexOf('export const CLEAN_INTERACTIONS');

if (addFuncEndIndex === -1 || footerStartIndex === -1) {
    console.error('Could not find split points.');
    process.exit(1);
}

const header = fileContent.substring(0, addFuncEndIndex);
const bodyRaw = fileContent.substring(addFuncEndIndex, footerStartIndex);
const footer = fileContent.substring(footerStartIndex);

function isSectionHeader(text) {
    const trimmed = text.trim();
    return trimmed.startsWith('// ==') || (trimmed.startsWith('// --') && trimmed.includes('SECTION'));
}

const chunks = [];
let chunkComments = [];

const lines = bodyRaw.split('\n');
let buffer = '';
let inAdd = false;
let parenCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inAdd) {
        if (trimmed.startsWith('//')) {
            if (!isSectionHeader(trimmed)) {
                chunkComments.push(line);
            }
        } else if (trimmed.startsWith('add(')) {
            inAdd = true;
            buffer += line + '\n';
            parenCount += (line.match(/\(/g) || []).length;
            parenCount -= (line.match(/\)/g) || []).length;

            if (parenCount === 0 && line.includes(');')) {
                inAdd = false;
                chunks.push({ comments: chunkComments, code: buffer });
                chunkComments = [];
                buffer = '';
            }
        }
    } else {
        buffer += line + '\n';
        parenCount += (line.match(/\(/g) || []).length;
        parenCount -= (line.match(/\)/g) || []).length;

        if (parenCount === 0 && line.includes(');')) {
            inAdd = false;
            chunks.push({ comments: chunkComments, code: buffer });
            chunkComments = [];
            buffer = '';
        }
    }
}

chunks.forEach(chunk => {
    // Remove "add(" and trim whitespace
    let argsContent = chunk.code.trim().substring(4).trim();

    let firstArg = '';

    if (argsContent.startsWith('[')) {
        // Array: ['Drug', ... or [VAR, ...
        // Remove leading [
        argsContent = argsContent.substring(1).trim();
        if (argsContent.startsWith("'") || argsContent.startsWith('"')) {
            const quote = argsContent[0];
            const endQuote = argsContent.indexOf(quote, 1);
            if (endQuote !== -1) {
                firstArg = argsContent.substring(1, endQuote);
            }
        } else {
            // Variable in array? e.g. [VAR, ...
            const match = argsContent.match(/^([a-zA-Z0-9_]+)/);
            if (match) firstArg = match[1];
        }
    } else if (argsContent.startsWith("'") || argsContent.startsWith('"')) {
        // String literal
        const quote = argsContent[0];
        const endQuote = argsContent.indexOf(quote, 1);
        if (endQuote !== -1) {
            firstArg = argsContent.substring(1, endQuote);
        }
    } else {
        // Variable or expression
        const match = argsContent.match(/^([a-zA-Z0-9_]+)/);
        if (match) {
            firstArg = match[1];
        }
    }

    // Clean up firstArg (remove extra quotes if any leaked, though logic above should handle it)
    // Also handle cases like "Drug Name (Brand)" -> "Drug Name" for sorting? 
    // No, alphabetical by full string is fine.

    chunk.sortKey = firstArg || 'zzzz';
});

chunks.sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'en', { sensitivity: 'base' }));

let newBody = '\n\n';
let currentLetter = '';

chunks.forEach(chunk => {
    let firstChar = chunk.sortKey.charAt(0).toUpperCase();
    // Group numbers together? Or just let them be.
    // Group variables?
    // If it's a variable like IRON_ORAL, first char is I.

    if (/[A-Z]/.test(firstChar)) {
        if (firstChar !== currentLetter) {
            currentLetter = firstChar;
            newBody += `// =============================================================================\n`;
            newBody += `// ============================== ${currentLetter} =================================\n`;
            newBody += `// =============================================================================\n\n`;
        }
    } else if (/[0-9]/.test(firstChar)) {
        if (currentLetter !== '#') {
            currentLetter = '#';
            newBody += `// =============================================================================\n`;
            newBody += `// ============================== # =================================\n`;
            newBody += `// =============================================================================\n\n`;
        }
    }

    if (chunk.comments.length > 0) {
        newBody += chunk.comments.join('\n') + '\n';
    }
    newBody += chunk.code + '\n';
});

const newContent = header + newBody + footer;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Database organized successfully.');
