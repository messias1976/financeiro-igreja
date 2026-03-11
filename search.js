const fs = require('fs');
const path = require('path');
const root = process.cwd();
function search(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        const content = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        if (content.includes('ContributionsPanel')) {
          console.log(path.join(dir, entry.name));
        }
      }
    } else if (entry.isDirectory()) {
      search(path.join(dir, entry.name));
    }
  }
}
search(root);
