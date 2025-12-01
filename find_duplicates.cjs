const fs = require('fs');
const path = 'c:\\Users\\CW\\Desktop\\drugcheck\\data\\database.ts';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split('\n');

    console.log('Scanning for duplicates...');

    for (let i = 0; i < lines.length - 1; i++) {
        const line1 = lines[i].trim();
        const line2 = lines[i + 1].trim();

        // Skip empty lines or short lines
        if (line1.length < 10) continue;

        // Check if lines are identical strings (ignoring trailing commas)
        const clean1 = line1.replace(/,$/, '');
        const clean2 = line2.replace(/,$/, '');

        if (clean1 === clean2 && clean1.startsWith("'") && /[^\x00-\x7F]/.test(clean1)) {
            // Check if it looks like an Arabic string
            console.log(`Duplicate found at line ${i + 1}: ${clean1}`);
            // Print context
            console.log(`Context: ${lines[i - 1].trim()}`);
        }
    }
} catch (err) {
    console.error(err);
}
