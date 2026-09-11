import React, { useState, useEffect } from 'react';
import { DisasterEngine } from './service/disaster-engine';
import { AlertLevel } from './models/types';
import { RadarView } from './views/RadarView';
import { NavigationView } from './views/NavigationView';
import { LocalEdgeView } from './views/LocalEdgeView';
import { HazardsView } from './views/HazardsView';
import { MeshNetworkView } from './views/MeshNetworkView';
import { BlackoutSurvivalView } from './views/BlackoutSurvivalView';
import { SheltersView } from './views/SheltersView';
import { FamilyShieldView } from './views/FamilyShieldView';
import { ProtocolsView } from './views/ProtocolsView';
import { SimulatorView } from './views/SimulatorView';
import { EmergencyOverlayDialog } from './components/EmergencyOverlayDialog';

// Single global engine instance
const engine = new DisasterEngine();

enum Tab {
  RADAR = 'RADAR',
  NAVIGATE = 'NAVIGATE',
  EDGE_AI = 'EDGE_AI',
  HAZARDS = 'HAZARDS',
  MESH = 'MESH',
  BLACKOUT = 'BLACKOUT',
  SHELTERS = 'SHELTERS',
  FAMILY_SHIELD = 'FAMILY_SHIELD',
  PROTOCOLS = 'PROTOCOLS',
  SIMULATOR = 'SIMULATOR',
}

const TABS = [
  { id: Tab.RADAR, title: 'Radar & Rings', icon: '📡' },
  { id: Tab.NAVIGATE, title: 'Offline Nav', icon: '🧭' },
  { id: Tab.EDGE_AI, title: 'Edge AI', icon: '⚡' },
  { id: Tab.HAZARDS, title: 'Multi-Hazard', icon: '⚠️' },
  { id: Tab.MESH, title: 'P2P Mesh', icon: '📶' },
  { id: Tab.BLACKOUT, title: 'Survival', icon: '🔋' },
  { id: Tab.SHELTERS, title: 'Shelters', icon: '🛡️' },
  { id: Tab.FAMILY_SHIELD, title: 'Family Shield', icon: '👨‍👩‍👧' },
  { id: Tab.PROTOCOLS, title: 'Protocols', icon: '📋' },
  { id: Tab.SIMULATOR, title: 'Test Hub', icon: '🧪' },
];

export const App: React.FC = () => {
  const [, setTick] = useState(0);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.RADAR);

  // Subscribe to engine state mutations
  useEffect(() => {
    const unsub = engine.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  const isDanger = engine.alertLevel === AlertLevel.DANGER;
  const isAdvisory = engine.alertLevel === AlertLevel.ADVISORY;
  const statusColor = isDanger ? '#FF1744' : isAdvisory ? '#FFB300' : '#00E5FF';

  // If Blackout mode is active, display pure OLED survival HUD
  if (engine.blackoutManager.isBlackoutModeActive) {
    return <BlackoutSurvivalView engine={engine} />;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#070A0E',
        color: '#FFFFFF',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          background: '#0B0F14',
          borderBottom: '1px solid #1E293B',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 900, fontSize: '18px', color: statusColor, letterSpacing: '2px' }}>
              WARNLY
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: statusColor,
                background: `${statusColor}22`,
                border: `1px solid ${statusColor}66`,
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {engine.alertLevel}
            </span>
          </div>

          {/* Quick Hardware & Sync Controls */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* 72h Survival toggle */}
            <button
              onClick={() => engine.blackoutManager.enter72HourSurvivalMode()}
              title="72-Hour Blackout Survival Mode"
              style={{
                background: '#1E293B',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              🔋
            </button>

            {/* Sync live APIs */}
            <button
              onClick={() => engine.syncAllLiveFeeds()}
              title="Sync Live Open-Meteo & USGS APIs"
              style={{
                background: '#1E293B',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              🔄
            </button>

            {/* Siren toggle */}
            <button
              onClick={() =>
                engine.siren.isActive ? engine.siren.stopSiren() : engine.siren.startSiren()
              }
              title="Toggle Acoustic Siren"
              style={{
                background: engine.siren.isActive ? '#D50000' : '#1E293B',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {engine.siren.isActive ? '🚨' : '🔊'}
            </button>

            {/* Optical strobe toggle */}
            <button
              onClick={() =>
                engine.opticalBeacon.isStrobeActive
                  ? engine.opticalBeacon.stopSosStrobe()
                  : engine.opticalBeacon.startSosStrobe()
              }
              title="Toggle Optical Morse SOS Torch"
              style={{
                background: engine.opticalBeacon.isStrobeActive ? '#FF9100' : '#1E293B',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              {engine.opticalBeacon.isStrobeActive ? '💡' : '🔦'}
            </button>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div
          style={{
            background: '#101721',
            padding: '5px 16px',
            fontSize: '11px',
            display: 'flex',
            justifyContent: 'space-between',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <span style={{ color: '#80D8FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📡 {engine.liveTelemetryStatus}
          </span>
          <span style={{ color: '#94A3B8', fontSize: '10px' }}>
            📍 {engine.locationName.split(' ')[0]}
          </span>
        </div>
      </header>

      {/* Main Content View */}
      <main style={{ flex: 1, paddingBottom: '70px' }}>
        {currentTab === Tab.RADAR && (
          <RadarView engine={engine} onNavigateToNav={() => setCurrentTab(Tab.NAVIGATE)} />
        )}
        {currentTab === Tab.NAVIGATE && <NavigationView engine={engine} />}
        {currentTab === Tab.EDGE_AI && <LocalEdgeView engine={engine} />}
        {currentTab === Tab.HAZARDS && <HazardsView engine={engine} />}
        {currentTab === Tab.MESH && <MeshNetworkView engine={engine} />}
        {currentTab === Tab.BLACKOUT && <BlackoutSurvivalView engine={engine} />}
        {currentTab === Tab.SHELTERS && (
          <SheltersView engine={engine} onNavigateToNav={() => setCurrentTab(Tab.NAVIGATE)} />
        )}
        {currentTab === Tab.FAMILY_SHIELD && <FamilyShieldView engine={engine} />}
        {currentTab === Tab.PROTOCOLS && <ProtocolsView />}
        {currentTab === Tab.SIMULATOR && <SimulatorView engine={engine} />}
      </main>

      {/* Bottom Tactical Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#0B0F14',
          borderTop: '1px solid #1E293B',
          zIndex: 100,
          overflowX: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '6px 8px',
            maxWidth: '600px',
            width: '100%',
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => {
            const isSelected = tab.id === currentTab;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: isSelected ? `1px solid ${statusColor}` : '1px solid transparent',
                  background: isSelected ? `${statusColor}22` : 'transparent',
                  color: isSelected ? statusColor : '#94A3B8',
                  fontSize: '11px',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Optical Screen Flash Strobe Overlay */}
      {engine.opticalBeacon.screenFlashState && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Emergency Danger Intrusion Overlay Dialog (FR-04) */}
      <EmergencyOverlayDialog
        isVisible={engine.isEmergencyOverlayVisible}
        hazardType={engine.selectedHazard}
        nearestStrikeKm={engine.nearestStrikeDistanceKm}
        nearestStrikeBearing={engine.nearestStrikeBearing}
        isSirenActive={engine.siren.isActive}
        isTorchActive={engine.opticalBeacon.isStrobeActive}
        onToggleSiren={() =>
          engine.siren.isActive ? engine.siren.stopSiren() : engine.siren.startSiren()
        }
        onToggleTorch={() =>
          engine.opticalBeacon.isStrobeActive
            ? engine.opticalBeacon.stopSosStrobe()
            : engine.opticalBeacon.startSosStrobe()
        }
        onDismiss={() => engine.dismissEmergencyOverlay()}
        onNavigateToShelter={() => {
          engine.dismissEmergencyOverlay();
          setCurrentTab(Tab.NAVIGATE);
        }}
      />
    </div>
  );
};
