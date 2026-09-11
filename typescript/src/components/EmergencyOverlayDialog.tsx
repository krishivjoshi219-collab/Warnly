import React from 'react';
import { HazardType } from '../models/types';

interface Props {
  isVisible: boolean;
  hazardType: HazardType;
  nearestStrikeKm: number | null;
  nearestStrikeBearing: number;
  isSirenActive: boolean;
  isTorchActive: boolean;
  onToggleSiren: () => void;
  onToggleTorch: () => void;
  onDismiss: () => void;
  onNavigateToShelter: () => void;
}

export const EmergencyOverlayDialog: React.FC<Props> = ({
  isVisible,
  hazardType,
  nearestStrikeKm,
  nearestStrikeBearing,
  isSirenActive,
  isTorchActive,
  onToggleSiren,
  onToggleTorch,
  onDismiss,
  onNavigateToShelter,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 2, 4, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#1E0608',
          border: '2px solid #FF1744',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 0 35px rgba(255, 23, 68, 0.4)',
        }}
      >
        {/* Flashing Banner */}
        <div
          style={{
            background: '#FF1744',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '14px',
            letterSpacing: '2px',
            textAlign: 'center',
            padding: '8px',
            borderRadius: '10px',
            marginBottom: '16px',
          }}
        >
          CRITICAL LIFE-SAFETY ALERT
        </div>

        <h2 style={{ color: '#FF5252', textAlign: 'center', fontSize: '20px', fontWeight: 800 }}>
          DANGER PERIMETER BREACH
        </h2>

        <p style={{ color: '#FFCDD2', fontSize: '13px', textAlign: 'center', margin: '10px 0 16px 0' }}>
          {nearestStrikeKm !== null
            ? `Lightning Strike Detected at ${nearestStrikeKm.toFixed(1)} km (Bearing ${Math.round(
                nearestStrikeBearing
              )}°)\nInside Thunder's 30-Second Travel Ring!`
            : 'Geophysical Threat Incursion Detected Inside Primary Danger Ring!'}
        </p>

        {/* Mandatory Action Checklist */}
        <div
          style={{
            background: '#2C0A0D',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ color: '#FF8A80', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
            MANDATORY EVACUATION ACTIONS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#FFFFFF' }}>
            <div>
              <strong style={{ color: '#FFD54F' }}>1. TAKE HARDENED INDOOR SHELTER IMMEDIATELY.</strong> Do not wait for rain or visual strike confirmation.
            </div>
            <div>
              <strong style={{ color: '#FFD54F' }}>2. SUSPEND CRANES & OUTDOOR WORK</strong> (OSHA Rule: 10-mile radius suspension).
            </div>
            <div>
              <strong style={{ color: '#FFD54F' }}>3. STAY AWAY</strong> from plumbing, corded electronics, and windows.
            </div>
            <div>
              <strong style={{ color: '#FFD54F' }}>4. 30-30 TIMER ACTIVE:</strong> Remain sheltered 30 full minutes after the last nearby strike.
            </div>
          </div>
        </div>

        {/* Hardware Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <button
            onClick={onToggleSiren}
            style={{
              padding: '12px',
              background: isSirenActive ? '#D50000' : '#334155',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {isSirenActive ? '🚨 Siren: ON' : '🔊 Siren: OFF'}
          </button>
          <button
            onClick={onToggleTorch}
            style={{
              padding: '12px',
              background: isTorchActive ? '#FF9100' : '#334155',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {isTorchActive ? '💡 SOS Strobe: ON' : '🔦 SOS Strobe: OFF'}
          </button>
        </div>

        {/* Navigation Action */}
        <button
          onClick={() => {
            onDismiss();
            onNavigateToShelter();
          }}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(90deg, #00C853 0%, #00E676 100%)',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          🧭 EVACUATE NOW (OFFLINE COMPASS HUD)
        </button>

        <button
          onClick={onDismiss}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            color: '#94A3B8',
            border: '1px solid #475569',
            borderRadius: '10px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Acknowledge & Dismiss Alert
        </button>
      </div>
    </div>
  );
};
