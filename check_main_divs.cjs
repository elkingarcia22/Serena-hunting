
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<div|<\/div>/g;

const startLine = 250;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    const index = match.index;
    const line = content.substring(0, index).split('\n').length;

    if (line < startLine) continue;

    if (tag === '<div') {
        const rest = content.substring(index);
        const endOfTag = rest.indexOf('>');
        const tagText = rest.substring(0, endOfTag + 1);
        if (tagText.endsWith('/>')) {
            // ignore
        } else {
            stack.push({ line, index });
        }
    } else {
        if (stack.length === 0) {
            console.log(`Extra </div> at line ${line}`);
        } else {
            stack.pop();
        }
    }
}

console.log("Final stack size from 250:", stack.length);
if (stack.length > 0) {
    stack.forEach(s => console.log(`Unclosed <div> at line ${s.line}`));
}
