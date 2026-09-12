import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DopplerRadarSummary } from '../../lib/warnly/doppler-vector';
import type { BarometricAnalysis } from '../../lib/warnly/barometric-surge';
import { Radar, Zap, ChevronRight, Gauge, AlertTriangle, CheckCircle2 } from '../Icons';
import { COLORS, RADII, FONTS } from '../../theme';

interface Props {
  doppler: DopplerRadarSummary | null;
  barometer: BarometricAnalysis | null;
  onOpenRadar: () => void;
}

export const DopplerVectorCard: React.FC<Props> = ({ doppler, barometer, onOpenRadar }) => {
  const hasMicroburst = barometer?.hasMicroburstRisk ?? false;
  const nearestCell = doppler?.nearestCell ?? null;
  const isIntercept = doppler?.activeIntercept ?? false;

  return (
    <View style={styles.container}>
      {/* ── 1. Barometric Downburst & Pressure Tendency Strip ── */}
      {barometer && (
        <View
          style={[
            styles.barometerStrip,
            hasMicroburst && styles.barometerStripDanger,
          ]}
        >
          <View style={styles.barometerLeft}>
            <Gauge size={14} color={hasMicroburst ? COLORS.danger : '#94A3B8'} />
            <Text style={styles.barometerPressure}>
              {barometer.currentHpa.toFixed(1)}{' '}
              <Text style={styles.barometerUnit}>hPa</Text>
            </Text>
          </View>

          <View style={styles.barometerDivider} />

          <View style={styles.barometerRight}>
            <View style={styles.tendencyRow}>
              {hasMicroburst ? (
                <AlertTriangle size={12} color={COLORS.danger} />
              ) : (
                <View style={styles.steadyDot} />
              )}
              <Text
                style={[
                  styles.tendencyText,
                  hasMicroburst && { color: COLORS.danger, fontWeight: '800' },
                ]}
                numberOfLines={1}
              >
                {hasMicroburst
                  ? `RAPID PRESSURE DROP (${barometer.delta3hHpa > 0 ? '+' : ''}${barometer.delta3hHpa} hPa)`
                  : `Pressure Tendency: ${barometer.delta3hHpa > 0 ? '+' : ''}${barometer.delta3hHpa} hPa / 3h (Steady)`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ── 2. Live Doppler Convective Cell Vector Card ── */}
      {nearestCell ? (
        <TouchableOpacity
          style={[
            styles.dopplerCard,
            isIntercept && styles.dopplerCardIntercept,
          ]}
          onPress={onOpenRadar}
          activeOpacity={0.8}
        >
          {/* Card Top Meta */}
          <View style={styles.dopplerHeader}>
            <View style={styles.dopplerHeaderLeft}>
              <View style={styles.radarIconWrap}>
                <Radar size={13} color={isIntercept ? COLORS.danger : '#38BDF8'} />
              </View>
              <Text style={styles.dopplerTitle}>DOPPLER CONVECTIVE VECTOR</Text>
            </View>

            <View
              style={[
                styles.interceptBadge,
                isIntercept ? styles.interceptBadgeCritical : styles.interceptBadgeClear,
              ]}
            >
              <Text
                style={[
                  styles.interceptBadgeText,
                  isIntercept ? { color: COLORS.danger } : { color: '#10B981' },
                ]}
              >
                {isIntercept
                  ? `INBOUND · ETA ${nearestCell.etaMinutes}m`
                  : 'CORRIDOR CLEAR'}
              </Text>
            </View>
          </View>

          {/* Storm Cell Readout Grid */}
          <View style={styles.cellReadout}>
            <View style={styles.cellMain}>
              <Text style={styles.cellName}>{nearestCell.name}</Text>
              <Text style={styles.cellDetail}>
                Core Reflectivity: <Text style={styles.highlightDbz}>{nearestCell.reflectivityDbz} dBZ</Text> · Top Alt {Math.round(nearestCell.topAltitudeFt / 1000)}k ft
              </Text>
            </View>

            <View style={styles.cellAction}>
              <Text style={styles.cellActionText}>Scope</Text>
              <ChevronRight size={14} color="#64748B" />
            </View>
          </View>

          {/* Tactical Vector Metrics Footer */}
          <View style={styles.vectorFooter}>
            <View style={styles.vectorItem}>
              <Text style={styles.vectorLabel}>BEARING</Text>
              <Text style={styles.vectorValue}>{nearestCell.bearingDeg}°</Text>
            </View>
            <View style={styles.vectorDivider} />
            <View style={styles.vectorItem}>
              <Text style={styles.vectorLabel}>RANGE</Text>
              <Text style={styles.vectorValue}>{nearestCell.distanceKm} km</Text>
            </View>
            <View style={styles.vectorDivider} />
            <View style={styles.vectorItem}>
              <Text style={styles.vectorLabel}>ADVECTION</Text>
              <Text style={styles.vectorValue}>{nearestCell.speedKmh} km/h</Text>
            </View>
            <View style={styles.vectorDivider} />
            <View style={styles.vectorItem}>
              <Text style={styles.vectorLabel}>CLOSEST PASS</Text>
              <Text style={[styles.vectorValue, isIntercept && { color: COLORS.danger }]}>
                {nearestCell.cpaDistanceKm} km
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  // ── Barometer Strip ──
  barometerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C131F',
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  barometerStripDanger: {
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  barometerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barometerPressure: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#F8FAFC',
  },
  barometerUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  barometerDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  barometerRight: {
    flex: 1,
  },
  tendencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  steadyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  tendencyText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // ── Doppler Convective Card ──
  dopplerCard: {
    backgroundColor: '#0C131F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    gap: 10,
  },
  dopplerCardIntercept: {
    borderColor: 'rgba(239,68,68,0.28)',
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  dopplerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dopplerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  radarIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dopplerTitle: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 1.2,
    color: '#64748B',
  },
  interceptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    borderWidth: 1,
  },
  interceptBadgeCritical: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: 'rgba(239,68,68,0.28)',
  },
  interceptBadgeClear: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.22)',
  },
  interceptBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.6,
  },
  cellReadout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellMain: {
    gap: 2,
  },
  cellName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  cellDetail: {
    fontSize: 11,
    color: '#94A3B8',
  },
  highlightDbz: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  cellAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.md,
  },
  cellActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  vectorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: RADII.md,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  vectorItem: {
    flex: 1,
    alignItems: 'center',
  },
  vectorDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  vectorLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    letterSpacing: 0.8,
    color: '#64748B',
  },
  vectorValue: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.mono,
    color: '#F8FAFC',
    marginTop: 1,
  },
});
