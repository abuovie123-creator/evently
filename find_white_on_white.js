const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'components'];
const projectRoot = 'C:\\Users\\DAbu\\Desktop\\Evently Ad PJ';

function scanDir(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(scanDir(fullPath));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check for text-white and bg-white on the same line, or text-white and white buttons
                if (line.includes('text-white') && line.includes('bg-white') && !line.includes('bg-white/')) {
                    results.push(`${fullPath}:${i + 1}: ${line.trim()}`);
                }
                // Check for placeholder-white and bg-white
                if (line.includes('placeholder-white') && line.includes('bg-white') && !line.includes('bg-white/')) {
                    results.push(`${fullPath}:${i + 1}: ${line.trim()}`);
                }
                // Check for Button with white background and white text
                // Actually, let's just look for any text-white combined with bg-white or bg-transparent on a white background
            }
            
            // Regex to find className blocks spanning multiple lines
            const classRegex = /className=(?:\{`|["'])([\s\S]*?)(?:`\}|["'])/g;
            let match;
            while ((match = classRegex.exec(content)) !== null) {
                const classStr = match[1];
                if (classStr.includes('text-white') && (classStr.includes('bg-white ') || classStr.endsWith('bg-white'))) {
                    // Let's find the line number
                    const untilMatch = content.substring(0, match.index);
                    const lineNo = untilMatch.split('\n').length;
                    results.push(`${fullPath}:${lineNo}: [Multiline Class] ${classStr.replace(/\n/g, ' ')}`);
                }
            }
        }
    }
    return results;
}

let allResults = [];
for (const dir of dirsToScan) {
    allResults = allResults.concat(scanDir(path.join(projectRoot, dir)));
}

// Remove duplicates
allResults = [...new Set(allResults)];

if (allResults.length > 0) {
    console.log("Found potential issues:");
    console.log(allResults.join('\n'));
} else {
    console.log("No text-white + bg-white issues found in the same class strings.");
}
