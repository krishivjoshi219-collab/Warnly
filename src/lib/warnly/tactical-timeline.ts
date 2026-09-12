/**
 * Warnly Tactical Action Countdown Engine ("Pre-Impact Timeline")
 *
 * Translates abstract meteorological numbers (radar dBZ, wind gust km/h, CAPE)
 * into a dynamic, phased survival action timeline synchronized with Doppler ETA.
 */

export interface TacticalActionItem {
  id: string;
  title: string;
  detail: string;
  priority: 'CRITICAL' | 'HIGH' | 'ADVISORY';
  completed: boolean;
  category: 'EXTERIOR' | 'ELECTRICAL' | 'SHELTER' | 'SAFETY';
}

export interface TacticalTimelinePhase {
  phaseId: 'T_MINUS_40' | 'T_MINUS_25' | 'T_MINUS_12' | 'T_MINUS_02' | 'T_PLUS_30';
  title: string;
  targetMinutes: number;
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT' | 'POST_STORM';
  summary: string;
  items: TacticalActionItem[];
}

export class TacticalTimelineEngine {
  private static defaultPhases: TacticalTimelinePhase[] = [
    {
      phaseId: 'T_MINUS_40',
      title: 'T - 40 MIN: PERIMETER HARDENING',
      targetMinutes: 40,
      urgencyLevel: 'LOW',
      summary: 'Storm cell approaching beyond 20 km. Secure loose ground items and external fixtures.',
      items: [
        {
          id: 'act-1',
          title: 'Secure Loose Outdoor Fixtures',
          detail: 'Stow outdoor furniture, solar panels, trampolines, and tarps to prevent wind missile hazard.',
          priority: 'HIGH',
          completed: false,
          category: 'EXTERIOR',
        },
        {
          id: 'act-2',
          title: 'Check Drainage & Culverts',
          detail: 'Ensure surface gutters and French drains are clear of leaves before rapid downpour.',
          priority: 'ADVISORY',
          completed: false,
          category: 'EXTERIOR',
        },
      ],
    },
    {
      phaseId: 'T_MINUS_25',
      title: 'T - 25 MIN: ELECTRICAL DECOUPLING',
      targetMinutes: 25,
      urgencyLevel: 'MEDIUM',
      summary: 'Outflow boundary detected. Disconnect high-voltage electronics to prevent inductive surge.',
      items: [
        {
          id: 'act-3',
          title: 'Unplug Sensitive Electronics & AC Units',
          detail: 'Ground strike electromagnetic pulse (EMP) can jump standard surge protectors.',
          priority: 'CRITICAL',
          completed: false,
          category: 'ELECTRICAL',
        },
        {
          id: 'act-4',
          title: 'Top Up Vital Device Batteries',
          detail: 'Ensure power banks, emergency flashlights, and medical devices are charged.',
          priority: 'HIGH',
          completed: false,
          category: 'ELECTRICAL',
        },
      ],
    },
    {
      phaseId: 'T_MINUS_12',
      title: 'T - 12 MIN: INTERIOR REFUGE',
      targetMinutes: 12,
      urgencyLevel: 'HIGH',
      summary: 'Direct stepped-leader ground strike zone active. Move all persons and animals indoors.',
      items: [
        {
          id: 'act-5',
          title: 'Move to Central Interior Room / High Ground',
          detail: 'Avoid exterior windows, sliding glass doors, and porches. Put shoes on.',
          priority: 'CRITICAL',
          completed: false,
          category: 'SHELTER',
        },
        {
          id: 'act-6',
          title: 'Bring Pets Indoors & Secure Go-Bag',
          detail: 'Keep carrier, emergency medicines, and clean drinking water within reach.',
          priority: 'HIGH',
          completed: false,
          category: 'SAFETY',
        },
      ],
    },
    {
      phaseId: 'T_MINUS_02',
      title: 'T - 02 MIN: CORE IMPACT IMMINENT',
      targetMinutes: 2,
      urgencyLevel: 'IMMINENT',
      summary: 'Severe convective core directly overhead. Zero outdoor transit permitted.',
      items: [
        {
          id: 'act-7',
          title: 'Avoid All Plumbing & Corded Devices',
          detail: 'Do not shower, wash hands, or touch metal pipes. Lightning travels through plumbing.',
          priority: 'CRITICAL',
          completed: false,
          category: 'SAFETY',
        },
        {
          id: 'act-8',
          title: 'Assume Crouched Posture if Caught Outdoors',
          detail: 'Crouch on balls of feet, minimize contact with ground, do not lie flat.',
          priority: 'CRITICAL',
          completed: false,
          category: 'SAFETY',
        },
      ],
    },
    {
      phaseId: 'T_PLUS_30',
      title: 'T + 30 MIN: HOLDING PERIOD (30/30 RULE)',
      targetMinutes: -30,
      urgencyLevel: 'POST_STORM',
      summary: 'Remain in hardened shelter for 30 minutes after the last recorded thunderclap.',
      items: [
        {
          id: 'act-9',
          title: 'Enforce 30-Minute Clear Window',
          detail: 'One in three lightning fatalities occur after the rain stops from trailing anvil strikes.',
          priority: 'CRITICAL',
          completed: false,
          category: 'SAFETY',
        },
      ],
    },
  ];

  private phases: TacticalTimelinePhase[];
  private itemStates: Record<string, boolean> = {};

  constructor() {
    this.phases = JSON.parse(JSON.stringify(TacticalTimelineEngine.defaultPhases));
  }

  /**
   * Evaluates active phase based on inbound convective storm cell ETA in minutes.
   */
  public evaluatePhase(etaMinutes: number | null): TacticalTimelinePhase {
    if (etaMinutes === null || etaMinutes > 35) {
      return this.phases[0]; // T-40
    }
    if (etaMinutes > 20) {
      return this.phases[1]; // T-25
    }
    if (etaMinutes > 8) {
      return this.phases[2]; // T-12
    }
    if (etaMinutes > 0) {
      return this.phases[3]; // T-02
    }
    return this.phases[4]; // T+30 post-storm holding
  }

  public getAllPhases(): TacticalTimelinePhase[] {
    return this.phases.map((p) => ({
      ...p,
      items: p.items.map((it) => ({
        ...it,
        completed: !!this.itemStates[it.id],
      })),
    }));
  }

  public toggleItem(itemId: string): boolean {
    this.itemStates[itemId] = !this.itemStates[itemId];
    return this.itemStates[itemId];
  }

  public isItemCompleted(itemId: string): boolean {
    return !!this.itemStates[itemId];
  }
}

export const globalTacticalTimeline = new TacticalTimelineEngine();
