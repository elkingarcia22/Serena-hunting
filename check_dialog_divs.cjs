
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<div|<\/div>/g;

const startLine = 766;
const endLine = 874;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    const index = match.index;
    const line = content.substring(0, index).split('\n').length;

    if (line < startLine) continue;
    if (line > endLine) break;

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

console.log("Unclosed <div> in block:");
stack.forEach(s => console.log(`Line ${s.line}`));
