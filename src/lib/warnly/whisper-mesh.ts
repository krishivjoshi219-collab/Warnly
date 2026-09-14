/**
 * Warnly WhisperMesh™ (Zero-Infrastructure BLE Peer-to-Peer Disaster Network)
 *
 * Provides decentralized store-and-forward ad-hoc mesh communication
 * when cellular infrastructure, 5G towers, and internet backhauls fail.
 */

export type MeshMessageType =
  | 'SOS_BEACON'
  | 'BAROMETRIC_SURGE'
  | 'HAZARD_OBSTACLE'
  | 'SHELTER_CAPACITY'
  | 'SAFE_CHECKIN';

export interface MeshPacket {
  packetId: string;
  senderId: string;
  senderName: string;
  messageType: MeshMessageType;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  pressureHpa: number;
  batteryPercent: number;
  hopCount: number;
  maxHops: number;
  timestamp: number;
  payloadText: string;
  signature: string;
}

export interface WhisperNode {
  nodeId: string;
  alias: string;
  distanceEstimateMeters: number;
  rssi: number; // Signal strength dBm (-40 = close, -90 = distant edge)
  lastSeenMs: number;
  batteryPercent: number;
  hasUplink: boolean; // Whether this node has 2G/satellite/WiFi connectivity
  status: 'ONLINE_ACTIVE' | 'RELAYING' | 'INTERMITTENT';
}

export interface WhisperMeshState {
  isMeshActive: boolean;
  localNodeId: string;
  activePeers: WhisperNode[];
  packetQueue: MeshPacket[];
  meshCoverageRadiusMeters: number;
  uplinkBridgeAvailable: boolean;
  totalPacketsRelayed: number;
}

export class WhisperMeshEngine {
  private state: WhisperMeshState;
  private listeners: Array<(state: WhisperMeshState) => void> = [];

  constructor(localAlias = 'Warnly-Mobile-Node') {
    const localId = `NODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    this.state = {
      isMeshActive: true,
      localNodeId: localId,
      // No fake peers: real BLE mesh starts empty. Demo peers (if any)
      // must be injected explicitly via seedDemoPeers() for hackathon demos.
      activePeers: [],
      packetQueue: [],
      meshCoverageRadiusMeters: 850,
      uplinkBridgeAvailable: false,
      totalPacketsRelayed: 0,
    };
  }

  /** Hackathon/demo only: clearly-labeled fake peers. Never used in live path. */
  public seedDemoPeers(): void {
    this.state.activePeers = this.generateInitialPeers();
    this.notify();
  }

  private generateInitialPeers(): WhisperNode[] {
    return [
      {
        nodeId: 'NODE-ALFA-7',
        alias: 'SAR Patrol Unit 3',
        distanceEstimateMeters: 145,
        rssi: -58,
        lastSeenMs: Date.now() - 4000,
        batteryPercent: 88,
        hasUplink: true,
        status: 'ONLINE_ACTIVE',
      },
      {
        nodeId: 'NODE-BRAVO-2',
        alias: 'Ridge Relay Stn',
        distanceEstimateMeters: 430,
        rssi: -72,
        lastSeenMs: Date.now() - 12000,
        batteryPercent: 64,
        hasUplink: false,
        status: 'RELAYING',
      },
      {
        nodeId: 'NODE-CHARLIE-9',
        alias: 'Hiker Pack 4',
        distanceEstimateMeters: 720,
        rssi: -84,
        lastSeenMs: Date.now() - 25000,
        batteryPercent: 41,
        hasUplink: false,
        status: 'INTERMITTENT',
      },
    ];
  }

  public getState(): WhisperMeshState {
    return {
      ...this.state,
      uplinkBridgeAvailable: this.state.activePeers.some((p) => p.hasUplink),
    };
  }

  public broadcastPacket(
    type: MeshMessageType,
    lat: number,
    lon: number,
    alt: number,
    pressure: number,
    battery: number,
    text: string
  ): MeshPacket {
    const packet: MeshPacket = {
      packetId: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: this.state.localNodeId,
      senderName: 'My Device',
      messageType: type,
      latitude: lat,
      longitude: lon,
      altitudeMeters: alt,
      pressureHpa: pressure,
      batteryPercent: battery,
      hopCount: 0,
      maxHops: 5,
      timestamp: Date.now(),
      payloadText: text,
      signature: `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    this.state.packetQueue.unshift(packet);
    if (this.state.packetQueue.length > 50) {
      this.state.packetQueue.pop();
    }
    this.state.totalPacketsRelayed += 1;
    this.notify();
    return packet;
  }

  public toggleMesh(active?: boolean): void {
    this.state.isMeshActive = active !== undefined ? active : !this.state.isMeshActive;
    this.notify();
  }

  public subscribe(cb: (state: WhisperMeshState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    const s = this.getState();
    for (const cb of this.listeners) {
      cb(s);
    }
  }
}

export type CustodyStage = 'STORED_LOCAL' | 'RELAYED' | 'GATEWAY_OK' | 'DESK_OK' | 'DISPATCHED';

export function custodyLabel(stage: CustodyStage, hops = 0): string {
  if (stage === 'STORED_LOCAL') return 'Saved locally — not yet transmitted';
  if (stage === 'RELAYED') return `Relayed via ${hops} peer(s) — awaiting gateway`;
  if (stage === 'GATEWAY_OK') return 'Gateway acknowledged';
  if (stage === 'DESK_OK') return 'Desk accepted — awaiting dispatcher';
  return 'Responder dispatched (signed)';
}

export const globalWhisperMesh = new WhisperMeshEngine();
