/**
 * AEGIS — Compound-Hazard Safety Compiler.
 * Three-valued logic: true | false | unknown. Hard constraints outrank scores.
 */
export type Tri = true | false | 'unknown';

export interface AegisInput {
  tornadoShelterDownstairs?: Tri;
  basementFlooded?: Tri;
  floodWaterRising?: Tri;
  lightningWithin10km?: Tri;
  hasInteriorHallway?: Tri;
  hasUpperFloor?: Tri;
  mobilityLimited?: Tri;
}

export interface AegisDecision {
  doNow: string;
  doNot: string[];
  fallback: string;
  blocked: string[];
  safe: boolean;
}

const isTrue = (v?: Tri) => v === true;
const isFalse = (v?: Tri) => v === false;

export function compileSafety(input: AegisInput): AegisDecision {
  const blocked: string[] = [];
  const doNot: string[] = [];

  // Hard constraint: never send people into flooded basement.
  if (isTrue(input.basementFlooded) || isTrue(input.floodWaterRising)) {
    blocked.push('BASEMENT_SHELTER');
    doNot.push('Do NOT go to basement — floodwater submerges lower levels');
  }
  if (isTrue(input.lightningWithin10km)) {
    doNot.push('Do NOT shelter near plumbing, wiring, or open windows');
  }

  let doNow = 'Monitor conditions — no verified refuge needed yet';
  let safe = true;

  const tornado = isTrue(input.tornadoShelterDownstairs);
  const basementBlocked = blocked.includes('BASEMENT_SHELTER');

  if (tornado && !basementBlocked) {
    doNow = 'Go to basement NOW — tornado shelter downstairs is verified dry';
  } else if (tornado && basementBlocked) {
    if (isTrue(input.hasInteriorHallway)) {
      doNow = 'Go to ground-floor interior hallway NOW — basement flooded, avoid lower levels';
    } else if (isTrue(input.hasUpperFloor) && !isTrue(input.floodWaterRising)) {
      doNow = 'Move to interior room on upper floor — avoid basement and windows';
    } else {
      doNow = 'No verified refuge — move to highest interior ground away from windows';
      safe = false;
    }
  } else if (isTrue(input.floodWaterRising)) {
    doNow = isTrue(input.mobilityLimited)
      ? 'Move vertically to highest floor NOW and signal for rescue'
      : 'Climb perpendicular to valley to +95m ridge NOW';
  } else if (isFalse(input.basementFlooded) && tornado) {
    doNow = 'Go to basement NOW';
  }

  const fallback = isTrue(input.mobilityLimited)
    ? 'If route blocked: lock interior door, call SOS, activate strobe + chirp'
    : 'If primary route blocked: take secondary interior corridor uphill, then re-evaluate';

  return { doNow, doNot, fallback, blocked, safe };
}
