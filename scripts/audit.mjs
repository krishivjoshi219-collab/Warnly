import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const warnings = [];
function checkExists(rel) {
  if (!fs.existsSync(path.join(root, rel))) failures.push(`missing required file: ${rel}`);
}
function checkJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  } catch (e) {
    failures.push(`invalid JSON in ${rel}: ${e.message}`);
    return null;
  }
}
const pkg = checkJson('package.json');
const appJson = checkJson('app.json');
const tsconfig = checkJson('tsconfig.json');
if (pkg && appJson?.expo?.version && pkg.version !== appJson.expo.version) {
  failures.push(`version drift: package.json ${pkg.version} != app.json ${appJson.expo.version}`);
}
if (tsconfig && !JSON.stringify(tsconfig.include || []).includes('src')) {
  failures.push('tsconfig.json include must contain src');
}
['index.html','index.js','src/App.tsx','src/main.tsx','vite.config.ts','tsconfig.json','app.json'].forEach(checkExists);
console.log(`failures: ${failures.length}`);
failures.forEach((f) => console.log(`FAIL: ${f}`));
if (failures.length > 0) process.exit(1);
else console.log('AUDIT: PASSED');
