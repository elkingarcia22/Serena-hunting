
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<div|<\/div>/g;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    const index = match.index;

    if (tag === '<div') {
        const rest = content.substring(index);
        const endOfTag = rest.indexOf('>');
        const tagText = rest.substring(0, endOfTag + 1);
        if (tagText.endsWith('/>')) {
            // ignore
        } else {
            stack.push(index);
        }
    } else {
        if (stack.length === 0) {
            console.log(`Extra </div> at index ${index}`);
        } else {
            stack.pop();
        }
    }
}

console.log("Final stack size:", stack.length);
if (stack.length > 0) {
    stack.forEach(idx => {
        const line = content.substring(0, idx).split('\n').length;
        console.log(`Unclosed <div> at line ${line}`);
    });
}
