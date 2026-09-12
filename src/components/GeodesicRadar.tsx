import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LightningStrike, AlertLevel } from '../types/convective';
import { COLORS, FONTS, RADII, SPACING } from '../theme';
import { Zap, Navigation, Plus, Minus, Info, ShieldAlert } from './Icons';

interface Props {
  strikes: LightningStrike[];
  alertLevel: AlertLevel;
  userLat: number;
  userLon: number;
  stormSpeedKmh: number;
  stormBearingDeg: number;
  leadTimeMinutes: number | null;
  onSelectStrike?: (strike: LightningStrike) => void;
}

export const GeodesicRadar: React.FC<Props> = ({
  strikes,
  alertLevel,
  userLat,
  userLon,
  stormSpeedKmh,
  stormBearingDeg,
  leadTimeMinutes,
  onSelectStrike,
}) => {
  const [zoomKm, setZoomKm] = useState<number>(25); // max radar radius displayed in km
  const [selectedStrike, setSelectedStrike] = useState<LightningStrike | null>(null);

  const radarSize = Math.min(Dimensions.get('window').width - 32, 360);
  const center = radarSize / 2;
  const pixelsPerKm = (radarSize / 2 - 20) / zoomKm;

  const isDanger = alertLevel === AlertLevel.DANGER;
  const isAdvisory = alertLevel === AlertLevel.ADVISORY;

  const handleZoomIn = () => setZoomKm((z) => Math.max(15, z - 5));
  const handleZoomOut = () => setZoomKm((z) => Math.min(40, z + 5));

  const handleTapStrike = (s: LightningStrike) => {
    setSelectedStrike(s);
    onSelectStrike?.(s);
  };

  // Concentric ring radii in pixels
  const r5km = 5 * pixelsPerKm;
  const r10km = 10 * pixelsPerKm;
  const r15km = 15 * pixelsPerKm;
  const r20km = 20 * pixelsPerKm;

  return (
    <View style={styles.cardContainer}>
      {/* Tactical Header */}
      <View style={styles.radarHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.indicatorPulse,
              {
                backgroundColor: isDanger
                  ? COLORS.danger
                  : isAdvisory
                  ? COLORS.warning
                  : COLORS.safe,
              },
            ]}
          />
          <Text style={styles.radarTitle}>GEODESIC DEFENSE RADAR</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.radarRangeTag}>RANGE: {zoomKm} KM</Text>
          <View style={styles.zoomButtons}>
            <TouchableOpacity
              onPress={handleZoomIn}
              style={styles.zoomBtn}
              activeOpacity={0.7}
            >
              <Plus size={12} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleZoomOut}
              style={styles.zoomBtn}
              activeOpacity={0.7}
            >
              <Minus size={12} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Radar Scope Viewport */}
      <View
        style={[
          styles.radarScope,
          {
            width: radarSize,
            height: radarSize,
            borderColor: isDanger ? COLORS.dangerBorder : COLORS.border,
          },
        ]}
      >
        {/* Cardinal Markers */}
        <Text style={[styles.cardinalText, styles.cardinalN]}>N</Text>
        <Text style={[styles.cardinalText, styles.cardinalE]}>E</Text>
        <Text style={[styles.cardinalText, styles.cardinalS]}>S</Text>
        <Text style={[styles.cardinalText, styles.cardinalW]}>W</Text>

        {/* Crosshair Lines */}
        <View style={[styles.axisCrosshair, { width: radarSize, height: 1 }]} />
        <View style={[styles.axisCrosshair, { height: radarSize, width: 1 }]} />

        {/* 20 km Outer Ring (if within zoom) */}
        {zoomKm >= 20 && (
          <View
            style={[
              styles.ring,
              {
                width: r20km * 2,
                height: r20km * 2,
                borderRadius: r20km,
                borderColor: '#1C293F',
              },
            ]}
          >
            <Text style={styles.ringLabel}>20 km</Text>
          </View>
        )}

        {/* 15 km Advisory Safety Ring */}
        <View
          style={[
            styles.ring,
            styles.advisoryRing,
            {
              width: r15km * 2,
              height: r15km * 2,
              borderRadius: r15km,
              borderColor: isAdvisory ? COLORS.warning : '#334460',
            },
          ]}
        >
          <Text
            style={[
              styles.ringLabel,
              { color: isAdvisory ? COLORS.warning : COLORS.textMuted },
            ]}
          >
            15 km ADVISORY
          </Text>
        </View>

        {/* 10 km Critical Danger Ring (Thunder 30s travel boundary) */}
        <View
          style={[
            styles.ring,
            styles.dangerRing,
            {
              width: r10km * 2,
              height: r10km * 2,
              borderRadius: r10km,
              borderColor: isDanger ? COLORS.danger : '#4A202A',
              backgroundColor: isDanger ? 'rgba(255, 42, 77, 0.08)' : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.ringLabel,
              { color: isDanger ? COLORS.danger : '#943040' },
            ]}
          >
            10 km CRITICAL DANGER
          </Text>
        </View>

        {/* 5 km Inner Ring */}
        <View
          style={[
            styles.ring,
            {
              width: r5km * 2,
              height: r5km * 2,
              borderRadius: r5km,
              borderColor: '#24344E',
            },
          ]}
        >
          <Text style={styles.ringLabel}>5 km</Text>
        </View>

        {/* Storm Advection Velocity Vector Arrow */}
        {stormSpeedKmh > 0 && (
          <View
            style={[
              styles.vectorWrapper,
              {
                transform: [{ rotate: `${stormBearingDeg}deg` }],
              },
            ]}
          >
            <View style={styles.vectorStem} />
            <View style={styles.vectorHead} />
          </View>
        )}

        {/* Center User Epicenter Marker */}
        <View style={styles.userMarkerCenter}>
          <View style={styles.userPulseHalo} />
          <View style={styles.userCoreDot} />
        </View>

        {/* Rendered Lightning Strikes */}
        {strikes.map((strike) => {
          if (strike.distanceKm > zoomKm) return null;

          // Convert distance (km) and bearing (deg) to cartesian (x, y)
          // 0 deg is North (up: -y), 90 deg is East (right: +x)
          const angleRad = ((strike.bearingDegrees - 90) * Math.PI) / 180;
          const distPx = strike.distanceKm * pixelsPerKm;
          const posX = center + distPx * Math.cos(angleRad);
          const posY = center + distPx * Math.sin(angleRad);

          const ageMinutes = (Date.now() - strike.timestamp) / (60 * 1000);
          const isRecent = ageMinutes < 5;
          const isOlder = ageMinutes >= 15;

          const strikeColor = isRecent
            ? '#FF0055'
            : isOlder
            ? '#FFB020'
            : '#FF6B00';

          const isCurrentSelected = selectedStrike?.id === strike.id;

          return (
            <TouchableOpacity
              key={strike.id}
              activeOpacity={0.8}
              onPress={() => handleTapStrike(strike)}
              style={[
                styles.strikeTouch,
                {
                  left: posX - 14,
                  top: posY - 14,
                  zIndex: isRecent ? 20 : 10,
                },
              ]}
            >
              <View
                style={[
                  styles.strikeMarker,
                  {
                    backgroundColor: strikeColor,
                    borderColor: isCurrentSelected ? '#FFFFFF' : strikeColor,
                    transform: isCurrentSelected ? [{ scale: 1.4 }] : [{ scale: 1 }],
                  },
                ]}
              >
                <Zap size={10} color="#FFFFFF" />
              </View>
              {isRecent && <View style={[styles.strikeHalo, { borderColor: strikeColor }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Strike Inspector Pill */}
      {selectedStrike ? (
        <View style={styles.inspectorCard}>
          <View style={styles.inspectorTop}>
            <View style={styles.inspectorTitleRow}>
              <Zap size={14} color={COLORS.danger} />
              <Text style={styles.inspectorId}>{selectedStrike.id}</Text>
              <View style={styles.providerBadge}>
                <Text style={styles.providerText}>{selectedStrike.provider}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedStrike(null)}
              style={styles.closeInspector}
            >
              <Text style={styles.closeInspectorText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inspectorGrid}>
            <View style={styles.inspectorCell}>
              <Text style={styles.inspectorLabel}>DISTANCE</Text>
              <Text style={styles.inspectorVal}>{selectedStrike.distanceKm.toFixed(1)} km</Text>
            </View>
            <View style={styles.inspectorCell}>
              <Text style={styles.inspectorLabel}>BEARING</Text>
              <Text style={styles.inspectorVal}>{selectedStrike.bearingDegrees}°</Text>
            </View>
            <View style={styles.inspectorCell}>
              <Text style={styles.inspectorLabel}>PEAK CURRENT</Text>
              <Text style={[styles.inspectorVal, { color: COLORS.danger }]}>
                {selectedStrike.intensityKa} kA
              </Text>
            </View>
            <View style={styles.inspectorCell}>
              <Text style={styles.inspectorLabel}>TYPE</Text>
              <Text style={styles.inspectorVal}>{selectedStrike.type === 'CG' ? 'Cloud-Ground' : 'In-Cloud'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF0055' }]} />
            <Text style={styles.legendText}>&lt; 5m</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B00' }]} />
            <Text style={styles.legendText}>5-15m</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFB020' }]} />
            <Text style={styles.legendText}>15-30m</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { borderColor: COLORS.danger }]} />
            <Text style={styles.legendText}>10 km Danger</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarRangeTag: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  zoomButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  zoomBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  radarScope: {
    position: 'relative',
    backgroundColor: '#05080E',
    borderRadius: RADII.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  cardinalText: {
    position: 'absolute',
    fontFamily: FONTS.mono,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    zIndex: 5,
  },
  cardinalN: { top: 6 },
  cardinalS: { bottom: 6 },
  cardinalE: { right: 8 },
  cardinalW: { left: 8 },
  axisCrosshair: {
    position: 'absolute',
    backgroundColor: 'rgba(30, 45, 68, 0.45)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ringLabel: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    backgroundColor: '#05080E',
    paddingHorizontal: 4,
  },
  dangerRing: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  advisoryRing: {
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  userMarkerCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  userPulseHalo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  userCoreDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.safe,
  },
  vectorWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    zIndex: 15,
  },
  vectorStem: {
    width: 2,
    height: 38,
    backgroundColor: COLORS.warning,
  },
  vectorHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.warning,
    transform: [{ rotate: '180deg' }],
  },
  strikeTouch: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  strikeHalo: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    opacity: 0.6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLine: {
    width: 10,
    height: 0,
    borderTopWidth: 2,
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  inspectorCard: {
    width: '100%',
    backgroundColor: '#090E17',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  inspectorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inspectorId: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  providerBadge: {
    backgroundColor: '#162234',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  providerText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  closeInspector: {
    padding: 2,
  },
  closeInspectorText: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  inspectorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inspectorCell: {
    alignItems: 'flex-start',
  },
  inspectorLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginBottom: 2,
  },
  inspectorVal: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
