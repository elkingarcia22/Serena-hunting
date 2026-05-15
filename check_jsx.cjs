
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<([a-zA-Z1-9]+)|<\/([a-zA-Z1-9]+)>|<([a-zA-Z1-9]+)[^>]*\/>/g;

let match;
let line = 1;
let lastIndex = 0;

while ((match = tagRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    line += (textBefore.match(/\n/g) || []).length;
    lastIndex = match.index;

    if (match[0].endsWith('/>')) {
        // Self-closing
    } else if (match[1]) {
        // Opening tag
        stack.push({ tag: match[1], line: line });
    } else if (match[2]) {
        // Closing tag
        if (stack.length === 0) {
            console.log(`Extra closing tag </${match[2]}> at line ${line}`);
        } else {
            const last = stack.pop();
            if (last.tag !== match[2]) {
                console.log(`Mismatch: <${last.tag}> at line ${last.line} closed by </${match[2]}> at line ${line}`);
            }
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags:");
    stack.forEach(s => console.log(`<${s.tag}> at line ${s.line}`));
}
