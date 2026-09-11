import React from 'react';
import { DisasterEngine } from '../service/disaster-engine';
import { Shelter } from '../models/types';

interface Props {
  engine: DisasterEngine;
  onNavigateToNav: () => void;
}

export const SheltersView: React.FC<Props> = ({ engine, onNavigateToNav }) => {
  const selected = engine.selectedShelter;

  return (
    <div style={{ padding: '14px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ color: '#00E5FF', fontWeight: 900, fontSize: '15px', letterSpacing: '1px' }}>
          VERIFIED HIGH-GROUND SHELTERS
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '12px' }}>
          Hardened civil defense structures with vertical elevation gain (+m) to escape flood inundation.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {engine.shelters.map((s) => {
          const isSelected = selected?.id === s.id;
          return (
            <div
              key={s.id}
              onClick={() => engine.selectShelter(s)}
              style={{
                background: isSelected ? '#0D2A3B' : '#0F1722',
                border: isSelected ? '1px solid #00E5FF' : '1px solid #1E293B',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800 }}>{s.name}</h4>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                    {s.distanceKm.toFixed(1)} km away • Bearing {Math.round(s.bearingDegrees)}°
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFD54F' }}>
                    +{s.requiredClimbMeters}m
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>Ridge Gain</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#A7F3D0',
                    background: 'rgba(0, 230, 118, 0.12)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Capacity: {s.capacity} pax
                </span>
                {s.hasBackupPower && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#FFD54F',
                      background: 'rgba(255, 213, 79, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    ⚡ Generator
                  </span>
                )}
                {s.hasMedicalAid && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#FF8A80',
                      background: 'rgba(255, 23, 68, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    🏥 First Aid
                  </span>
                )}
              </div>

              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToNav();
                  }}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '10px',
                    background: '#00E676',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  🧭 Launch Autonomous Evacuation HUD to this Shelter
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
