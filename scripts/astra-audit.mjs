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
function mustContain(rel, needle, label) {
  const src = fs.readFileSync(path.join(root, rel), 'utf8');
  if (!src.includes(needle)) { console.log(`FAIL: ${label} missing "${needle}" in ${rel}`); fail++; }
  else console.log(`PASS: ${label}`);
}
// Thesis: uncertain info -> defensible action when infra fails
mustContain('src/lib/warnly/astra/signallock.ts', 'UNVERIFIED', 'SIGNALLOCK lifecycle');
mustContain('src/lib/warnly/astra/signallock.ts', 'isActionable', 'SIGNALLOCK actionable gate');
mustContain('src/lib/warnly/astra/aegis.ts', 'BASEMENT_SHELTER', 'AEGIS hard constraint');
mustContain('src/lib/warnly/astra/aegis.ts', 'fallback', 'AEGIS do/do-not/fallback');
mustContain('src/lib/warnly/astra/refuge-id.ts', 'parseAnchor', 'REFUGE-ID QR anchor');
mustContain('src/lib/warnly/astra/refuge-id.ts', 'findRoute', 'REFUGE-ID reroute');
mustContain('src/lib/warnly/astra/cutline.ts', 'SHELTER_IN_PLACE', 'CUTLINE stop-driving advice');
mustContain('src/lib/warnly/astra/pressurenet.ts', 'hampel', 'PRESSURENET artifact filter');
mustContain('src/lib/warnly/astra/pact.ts', 'SELF_REPORTED_SAFE', 'PACT state machine');
mustContain('src/lib/warnly/astra/rescuechain.ts', 'STORED_LOCAL', 'RESCUECHAIN custody');
mustContain('src/lib/warnly/astra/rescuechain.ts', 'acceptReceipt', 'RESCUECHAIN signed receipt');
mustContain('src/lib/warnly/astra/echotrace.ts', 'rangeFromToF', 'ECHOTRACE ToF');
mustContain('src/lib/warnly/astra/lifereserve.ts', 'shouldBeacon', 'LIFERESERVE rendezvous');
mustContain('src/lib/warnly/astra/groundtruth.ts', 'mergeMaps', 'GROUNDTRUTH CRDT merge');
mustContain('src/lib/warnly/risk.ts', 'compileAegisFromRisk', 'AEGIS wired into risk.ts');
mustContain('src/lib/warnly/sos-share.ts', 'sosBundleFromContext', 'RESCUECHAIN wired into sos-share.ts');
mustContain('README.md', 'Astra', 'README judge pitch');
// Regression guard: existing core files must still exist
for (const r of ['src/lib/warnly/risk.ts','src/lib/warnly/sos-share.ts','src/App.tsx','package.json']) {
  if (!fs.existsSync(path.join(root, r))) { console.log(`FAIL: core missing ${r}`); fail++; }
}
console.log(fail === 0 ? 'ASTRA AUDIT: PASSED' : `ASTRA AUDIT: FAILED (${fail})`);
process.exit(fail === 0 ? 0 : 1);
