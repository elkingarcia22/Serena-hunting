
const fs = require('fs');
const content = fs.readFileSync('src/app/components/JobView.tsx', 'utf8');

let stack = [];
const tagRegex = /<([a-zA-Z0-9.]+)|<\/([a-zA-Z0-9.]*)>/g;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const openTag = match[1];
    const closeTag = match[2];
    const index = match.index;
    const line = content.substring(0, index).split('\n').length;

    if (line < 249) continue;

    if (openTag) {
        // Check for self-closing
        const rest = content.substring(index);
        const endOfTag = rest.indexOf('>');
        const tagText = rest.substring(0, endOfTag + 1);
        if (tagText.endsWith('/>')) {
            // ignore
        } else {
            stack.push({ tag: openTag, line });
        }
    } else if (closeTag !== undefined) {
        if (stack.length === 0) {
            console.log(`Extra closing tag </${closeTag}> at line ${line}`);
        } else {
            const last = stack.pop();
            if (closeTag !== "" && last.tag !== closeTag) {
                // Fragment close tag is empty string in regex if it's </>? No.
                // Actually </> matches <\/([a-zA-Z0-9.]*)> where closeTag is ""
                if (closeTag === "" && (last.tag === "" || last.tag === undefined)) {
                    // Fragment
                } else if (closeTag !== last.tag) {
                     console.log(`Mismatch: opened <${last.tag}> at line ${last.line}, closed </${closeTag}> at line ${line}`);
                }
            }
        }
    }
}

console.log("Final stack size:", stack.length);
stack.forEach(s => console.log(`Unclosed <${s.tag}> at line ${s.line}`));
