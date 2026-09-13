import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'src/lib/warnly/astra/signallock.ts',
  'src/lib/warnly/astra/aegis.ts',
  'src/lib/warnly/astra/refuge-id.ts',
  'src/lib/warnly/astra/cutline.ts',
  'src/lib/warnly/astra/pressurenet.ts',
  'src/lib/warnly/astra/pact.ts',
  'src/lib/warnly/astra/rescuechain.ts',
  'src/lib/warnly/astra/echotrace.ts',
  'src/lib/warnly/astra/lifereserve.ts',
  'src/lib/warnly/astra/groundtruth.ts',
  'src/lib/warnly/astra/index.ts',
];
let fail = 0;
for (const r of required) {
  const ok = fs.existsSync(path.join(root, r));
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${r}`);
  if (!ok) fail++;
  if (ok) {
    const src = fs.readFileSync(path.join(root, r), 'utf8');
    if (src.length < 200) { console.log(`FAIL: ${r} too small`); fail++; }
    if (!/export (function|interface|type|const)/.test(src)) { console.log(`FAIL: ${r} no exports`); fail++; }
  }
}
// Regression guard: existing core files must still exist
for (const r of ['src/lib/warnly/risk.ts','src/lib/warnly/sos-share.ts','src/App.tsx','package.json']) {
  if (!fs.existsSync(path.join(root, r))) { console.log(`FAIL: core missing ${r}`); fail++; }
}
console.log(fail === 0 ? 'ASTRA AUDIT: PASSED' : `ASTRA AUDIT: FAILED (${fail})`);
process.exit(fail === 0 ? 0 : 1);
