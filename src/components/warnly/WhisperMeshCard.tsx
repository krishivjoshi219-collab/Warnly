import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Radio,
  Wifi,
  Users,
  Share2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from '../Icons';
import {
  globalWhisperMesh,
  WhisperMeshState,
} from '../../lib/warnly/whisper-mesh';
import { COLORS, RADII, FONTS, SPACING } from '../../theme';

export const WhisperMeshCard: React.FC = () => {
  const [meshState, setMeshState] = useState<WhisperMeshState>(() =>
    globalWhisperMesh.getState()
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    const unsub = globalWhisperMesh.subscribe((s) => setMeshState(s));
    return () => unsub();
  }, []);

  const handleBroadcastSos = () => {
    globalWhisperMesh.broadcastPacket(
      'SOS_BEACON',
      30.3165,
      78.0322,
      1620,
      1008.4,
      78,
      'EMERGENCY EVACUATION ASSISTANCE REQUESTED'
    );
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Radio size={11} color={COLORS.safe} />
            <Text style={styles.badgeText}>ZERO-INFRASTRUCTURE P2P MESH</Text>
          </View>
          <Text style={styles.title}>WARNLY WHISPERMESH™</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.expandText}>{isExpanded ? 'Hide' : 'Nodes'}</Text>
          {isExpanded ? (
            <ChevronUp size={13} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={13} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Ad-hoc Bluetooth Low Energy (BLE) store-and-forward mesh relaying life-safety packets without cellular towers.
      </Text>

      {/* Mesh Telemetry Strip */}
      <View style={styles.meshStrip}>
        <View style={styles.meshCol}>
          <Text style={styles.meshLabel}>ACTIVE PEERS</Text>
          <View style={styles.peerCountRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.meshValue}>{meshState.activePeers.length} Nodes</Text>
          </View>
        </View>

        <View style={styles.meshDivider} />

        <View style={styles.meshCol}>
          <Text style={styles.meshLabel}>COVERAGE RADIUS</Text>
          <Text style={styles.meshValue}>{meshState.meshCoverageRadiusMeters}m</Text>
        </View>

        <View style={styles.meshDivider} />

        <View style={styles.meshCol}>
          <Text style={styles.meshLabel}>SATELLITE/2G BRIDGE</Text>
          <Text
            style={[
              styles.meshValue,
              { color: meshState.uplinkBridgeAvailable ? COLORS.safe : COLORS.warning },
            ]}
          >
            {meshState.uplinkBridgeAvailable ? 'UPLINK ACTIVE' : 'LOCAL ONLY'}
          </Text>
        </View>
      </View>

      {/* SOS Relay Action */}
      <TouchableOpacity
        style={[styles.sosBroadcastBtn, sosSent && styles.sosBroadcastBtnSent]}
        onPress={handleBroadcastSos}
        activeOpacity={0.8}
      >
        <Share2 size={13} color={sosSent ? COLORS.safe : COLORS.danger} />
        <Text style={[styles.sosBroadcastText, sosSent && { color: COLORS.safe }]}>
          {sosSent
            ? 'SOS BROADCASTED ACROSS 3 MESH HOPS'
            : 'BROADCAST EMERGENCY SOS TO NEARBY PEERS'}
        </Text>
      </TouchableOpacity>

      {/* Expanded Peer Node List */}
      {isExpanded && (
        <View style={styles.peerList}>
          <Text style={styles.peerListHeader}>NEARBY AD-HOC HOPS</Text>
          {meshState.activePeers.map((peer) => (
            <View key={peer.nodeId} style={styles.peerRow}>
              <View style={styles.peerLeft}>
                <View style={styles.peerDot} />
                <View>
                  <Text style={styles.peerAlias}>{peer.alias}</Text>
                  <Text style={styles.peerId}>{peer.nodeId} · {peer.rssi} dBm</Text>
                </View>
              </View>
              <View style={styles.peerRight}>
                <Text style={styles.peerDist}>~{peer.distanceEstimateMeters}m</Text>
                <Text style={styles.peerStatus}>
                  {peer.hasUplink ? 'Bridge Node' : 'Relay'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.safe,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  meshStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    padding: 10,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  meshCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  meshDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
  },
  meshLabel: {
    fontSize: 8.5,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  peerCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.safe,
  },
  meshValue: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  sosBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 9,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  sosBroadcastBtnSent: {
    backgroundColor: COLORS.safeBg,
    borderColor: COLORS.safeBorder,
  },
  sosBroadcastText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: COLORS.danger,
    letterSpacing: 0.3,
  },
  peerList: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  peerListHeader: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  peerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  peerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.safe,
  },
  peerAlias: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  peerId: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.textMuted,
  },
  peerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  peerDist: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.mono,
    color: COLORS.textPrimary,
  },
  peerStatus: {
    fontSize: 9,
    fontFamily: FONTS.mono,
    color: COLORS.safe,
  },
});
