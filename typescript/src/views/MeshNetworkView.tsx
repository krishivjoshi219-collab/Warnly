import React, { useState } from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { CompressedSmsBeacon } from '../telephony/compressed-sms';

interface Props {
  engine: DisasterEngine;
}

export const MeshNetworkView: React.FC<Props> = ({ engine }) => {
  const mesh = engine.meshNetwork;
  const [survivorCount, setSurvivorCount] = useState(3);
  const [triageStatus, setTriageStatus] = useState('TRAPPED_HIGH_WATER');

  const handleBroadcastSos = () => {
    mesh.broadcastSurvivorSos(
      survivorCount,
      triageStatus,
      engine.userLatitude,
      engine.userLongitude
    );
  };

  const handleSendSms = () => {
    const payload = CompressedSmsBeacon.encodeDistressPayload(
      engine.userLatitude,
      engine.userLongitude,
      triageStatus,
      engine.blackoutManager.batteryPercent,
      engine.selectedShelter?.name || 'CIVIC_BUNKER'
    );
    CompressedSmsBeacon.dispatchSms('112', payload);
  };

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          OFF-GRID P2P DISASTER MESH RELAY
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Zero cellular / internet reliance. Ad-hoc peer flooding with 4-hop deduplication.
        </p>
      </div>

      {/* Mesh Status Card */}
      <div
        style={{
          background: '#0F1722',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>LOCAL NODE ID</div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#00E5FF' }}>
              {mesh.nodeId} ({mesh.alias})
            </div>
          </div>
          <button
            onClick={() => (mesh.isMeshActive ? mesh.stopMesh() : mesh.startMesh())}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: mesh.isMeshActive ? '#D50000' : '#00C853',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            {mesh.isMeshActive ? 'HALT MESH' : 'ACTIVATE P2P MESH'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
          <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>PEERS LINKED</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#00E676' }}>
              {mesh.connectedPeers.length} Nodes
            </div>
          </div>
          <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>PACKETS RELAYED</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFD54F' }}>
              {mesh.receivedPackets.length}
            </div>
          </div>
          <div style={{ background: '#172230', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>MAX HOPS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#80D8FF' }}>4 Hops</div>
          </div>
        </div>
      </div>

      {/* Trapped Survivor SOS Trigger */}
      <div
        style={{
          background: '#1F060A',
          border: '1px solid #FF1744',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '14px',
        }}
      >
        <div style={{ color: '#FF5252', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
          🚨 TRAPPED SURVIVOR SOS DISTRESS BEACON
        </div>
        <p style={{ color: '#E2E8F0', fontSize: '12px', marginBottom: '12px' }}>
          Floods encrypted distress packets through all nearby devices to locate search & rescue teams.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <select
            value={survivorCount}
            onChange={(e) => setSurvivorCount(Number(e.target.value))}
            style={{
              flex: 1,
              padding: '8px',
              background: '#2C0A0E',
              color: '#FFFFFF',
              border: '1px solid #FF5252',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          >
            <option value={1}>1 Survivor</option>
            <option value={2}>2 Survivors</option>
            <option value={3}>3 Survivors</option>
            <option value={4}>4+ Survivors</option>
          </select>

          <select
            value={triageStatus}
            onChange={(e) => setTriageStatus(e.target.value)}
            style={{
              flex: 2,
              padding: '8px',
              background: '#2C0A0E',
              color: '#FFFFFF',
              border: '1px solid #FF5252',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          >
            <option value="TRAPPED_WATER_RISING">Water Rising Rapidly</option>
            <option value="STRUCTURAL_COLLAPSE">Structural Collapse / Rubble</option>
            <option value="MEDICAL_EMERGENCY">Severe Medical Trauma</option>
            <option value="STRANDED_HIGH_RIDGE">Stranded on Ridge</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={handleBroadcastSos}
            style={{
              padding: '12px',
              background: mesh.sosDistressActive ? '#B71C1C' : '#FF1744',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {mesh.sosDistressActive ? 'RE-BROADCAST SOS' : 'BROADCAST P2P SOS'}
          </button>

          <button
            onClick={handleSendSms}
            style={{
              padding: '12px',
              background: '#1565C0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 900,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            1-TAP 2G SMS BEACON
          </button>
        </div>
      </div>

      {/* Live Peer & Packet Inspector */}
      <div style={{ background: '#0F1722', borderRadius: '16px', padding: '16px' }}>
        <div style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
          PACKET STREAM & NEARBY PEERS
        </div>
        {mesh.receivedPackets.length === 0 ? (
          <div style={{ color: '#94A3B8', fontSize: '12px', padding: '12px 0' }}>
            No incoming mesh packets. Channel active on `warnly_disaster_mesh_v1`.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mesh.receivedPackets.slice(0, 5).map((pkt) => (
              <div
                key={pkt.id}
                style={{
                  background: '#172230',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFD54F' }}>
                  <span>{pkt.senderAlias}</span>
                  <span>Hop {pkt.hopCount}/{pkt.maxHops}</span>
                </div>
                <div style={{ color: '#FFFFFF', marginTop: '2px' }}>{pkt.payload}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
