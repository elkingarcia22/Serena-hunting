
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<div|<\/div>/g;

let match;
let lastIndex = 0;
let lines = content.split('\n');
let currentLine = 1;
let lineStartIndices = [0];
for (let i = 0; i < lines.length; i++) {
    lineStartIndices.push(lineStartIndices[i] + lines[i].length + 1);
}

function getLineNum(index) {
    for (let i = 0; i < lineStartIndices.length; i++) {
        if (lineStartIndices[i] > index) return i;
    }
    return lineStartIndices.length;
}

while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    const index = match.index;
    const lineNum = getLineNum(index);

    if (tag === '<div') {
        // Check for self-closing
        const rest = content.substring(index);
        const endOfTag = rest.indexOf('>');
        const tagText = rest.substring(0, endOfTag + 1);
        if (tagText.endsWith('/>')) {
            // Self-closing, ignore
        } else {
            stack.push(lineNum);
        }
    } else {
        if (stack.length === 0) {
            console.log(`Extra </div> at line ${lineNum}`);
        } else {
            stack.pop();
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed <div> started at lines:");
    console.log(stack.join(', '));
}
