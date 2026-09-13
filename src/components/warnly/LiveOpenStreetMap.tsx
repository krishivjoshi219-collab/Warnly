import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Linking,
  PanResponder,
} from 'react-native';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Plus,
  Minus,
  Navigation,
  Layers,
  X,
  Phone,
  Compass,
  Radar,
} from '../Icons';
import { COLORS, RADII, FONTS, SHADOWS } from '../../theme';
import type { Coords, Strike } from '../../lib/warnly/types';
import type { SafetyCamp } from '../../lib/warnly/shelters';
import type { DopplerRadarSummary } from '../../lib/warnly/doppler-vector';
import { fetchRainViewerRadar, type RadarFrame } from '../../lib/warnly/weather';

interface Props {
  coords: Coords;
  width: number;
  height: number;
  strikes?: Strike[];
  camps?: SafetyCamp[];
  doppler?: DopplerRadarSummary | null;
  showRadarOverlay?: boolean;
  onRecenter?: () => void;
  onSelectLocation?: (coords: Coords) => void;
}

type MapLayerType = 'satellite' | 'streets' | 'topo';

// ─── Web Mercator Projection Calculations ─────────────────────────────────────
function lon2tile(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom);
}

function lat2tile(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    Math.pow(2, zoom)
  );
}

function tile2lon(tileX: number, zoom: number): number {
  return (tileX / Math.pow(2, zoom)) * 360 - 180;
}

function tile2lat(tileY: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * tileY) / Math.pow(2, zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export const LiveOpenStreetMap: React.FC<Props> = ({
  coords,
  width,
  height,
  strikes = [],
  camps = [],
  doppler,
  showRadarOverlay = true,
  onRecenter,
  onSelectLocation,
}) => {
  const [zoom, setZoom] = useState(12);
  const [layer, setLayer] = useState<MapLayerType>('satellite');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedCamp, setSelectedCamp] = useState<SafetyCamp | null>(null);

  // RainViewer Live Doppler Radar Overlay
  const [showRadar, setShowRadar] = useState(showRadarOverlay);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(-1);

  // Fetch RainViewer radar tiles on mount & every 2 minutes
  useEffect(() => {
    let mounted = true;
    const loadRadar = () => {
      fetchRainViewerRadar().then(({ host, frames }) => {
        if (mounted && frames.length > 0) {
          setRadarHost(host);
          setRadarFrames(frames);
          setCurrentFrameIdx(frames.length - 1);
        }
      });
    };
    loadRadar();
    const interval = setInterval(loadRadar, 2 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Recenter map on hardware GPS coords update
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [coords.lat, coords.lon]);

  const centerLat = coords.lat;
  const centerLon = coords.lon;

  const centerTileX = lon2tile(centerLon, zoom);
  const centerTileY = lat2tile(centerLat, zoom);

  const subTileX = (centerTileX - Math.floor(centerTileX)) * 256;
  const subTileY = (centerTileY - Math.floor(centerTileY)) * 256;

  // 3x3 grid of 256x256 tiles to cover the viewport
  const tileIndices = [-1, 0, 1];
  const maxTile = Math.pow(2, zoom) - 1;

  const getTileUrl = (tx: number, ty: number) => {
    const wrappedX = ((tx % (maxTile + 1)) + (maxTile + 1)) % (maxTile + 1);
    const clampedY = Math.max(0, Math.min(maxTile, ty));

    if (layer === 'streets') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zoom}/${clampedY}/${wrappedX}`;
    }
    if (layer === 'topo') {
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${zoom}/${clampedY}/${wrappedX}`;
    }
    // High-Res Photographic ESRI World Imagery
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${clampedY}/${wrappedX}`;
  };

  const getRadarTileUrl = (tx: number, ty: number) => {
    if (!showRadar || radarFrames.length === 0 || currentFrameIdx < 0 || zoom > 7) return null;
    const frame = radarFrames[currentFrameIdx];
    if (!frame) return null;
    const wrappedX = ((tx % (maxTile + 1)) + (maxTile + 1)) % (maxTile + 1);
    const clampedY = Math.max(0, Math.min(maxTile, ty));
    return `${radarHost}${frame.path}/256/${zoom}/${wrappedX}/${clampedY}/2/1_1.png`;
  };

  const handleZoomIn = () => setZoom((z) => Math.min(16, z + 1));
  const handleZoomOut = () => setZoom((z) => Math.max(4, z - 1));
  const toggleLayer = () => {
    setLayer((l) => (l === 'satellite' ? 'streets' : l === 'streets' ? 'topo' : 'satellite'));
  };

  // Pan gesture tracking for smooth map panning
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3;
      },
      onPanResponderGrant: () => {
        panStartRef.current = { ...panOffset };
        isDraggingRef.current = false;
      },
      onPanResponderMove: (_, gesture) => {
        if (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4) {
          isDraggingRef.current = true;
        }
        setPanOffset({
          x: panStartRef.current.x + gesture.dx,
          y: panStartRef.current.y + gesture.dy,
        });
      },
      onPanResponderRelease: (e, gesture) => {
        // If it was a tap (not a drag), pinpoint location
        if (!isDraggingRef.current && onSelectLocation) {
          const { locationX, locationY } = e.nativeEvent;
          const offsetX = locationX - (width / 2 + panOffset.x);
          const offsetY = locationY - (height / 2 + panOffset.y);
          const targetTileX = centerTileX + offsetX / 256;
          const targetTileY = centerTileY + offsetY / 256;
          const tappedLat = tile2lat(targetTileY, zoom);
          const tappedLon = tile2lon(targetTileX, zoom);
          onSelectLocation({
            lat: Math.round(tappedLat * 10000) / 10000,
            lon: Math.round(tappedLon * 10000) / 10000,
          });
        }
      },
    })
  ).current;

  const currentFrame = radarFrames[currentFrameIdx];
  const frameTimeStr = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.container, { width, height }]}>
      {/* ── Real Map Tile Grid with PanResponder ── */}
      <View {...panResponder.panHandlers} style={styles.tileCanvas}>
        {tileIndices.map((dx) =>
          tileIndices.map((dy) => {
            const tx = Math.floor(centerTileX) + dx;
            const ty = Math.floor(centerTileY) + dy;
            const posX = dx * 256 + width / 2 - subTileX + panOffset.x;
            const posY = dy * 256 + height / 2 - subTileY + panOffset.y;
            const radarUrl = getRadarTileUrl(tx, ty);

            return (
              <React.Fragment key={`${zoom}-${tx}-${ty}-${layer}`}>
                <Image
                  source={{ uri: getTileUrl(tx, ty) }}
                  style={[
                    styles.tileImage,
                    {
                      left: posX,
                      top: posY,
                      width: 256,
                      height: 256,
                    },
                  ]}
                  resizeMode="cover"
                />
                {/* ── RainViewer Doppler Radar Tile Layer (Transparent Cloud Mosaic) ── */}
                {radarUrl && (
                  <Image
                    source={{ uri: radarUrl }}
                    style={[
                      styles.tileImage,
                      styles.radarTile,
                      {
                        left: posX,
                        top: posY,
                        width: 256,
                        height: 256,
                      },
                    ]}
                    resizeMode="cover"
                  />
                )}
              </React.Fragment>
            );
          })
        )}
      </View>

      {/* ── Map Grid Overlay & Crosshair Vignette ── */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* ── Top Helper Hint Banner ── */}
      <View style={styles.mapHintBanner} pointerEvents="none">
        <MapPin size={10} color={COLORS.safe} />
        <Text style={styles.mapHintText}>Tap anywhere on map to pinpoint exact location</Text>
      </View>

      {/* ── User GPS Center Pin ── */}
      <View
        style={[
          styles.centerPin,
          {
            left: width / 2 + panOffset.x - 14,
            top: height / 2 + panOffset.y - 14,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.gpsPulseRing} />
        <View style={styles.gpsCenterDot}>
          <View style={styles.gpsInnerCore} />
        </View>
        <View style={styles.youBadge}>
          <Text style={styles.youBadgeText}>YOU</Text>
        </View>
      </View>

      {/* ── Lightning Strike Markers ── */}
      {strikes.map((s) => {
        const mX = (lon2tile(s.lon, zoom) - centerTileX) * 256 + width / 2 + panOffset.x;
        const mY = (lat2tile(s.lat, zoom) - centerTileY) * 256 + height / 2 + panOffset.y;

        // Clip out of view
        if (mX < -20 || mX > width + 20 || mY < -20 || mY > height + 20) return null;

        return (
          <View
            key={`strike-${s.id}`}
            style={[styles.strikeMarker, { left: mX - 10, top: mY - 10 }]}
          >
            <View style={styles.strikeDot}>
              <Zap size={10} color="#FFFFFF" />
            </View>
            <Text style={styles.strikeDistText}>{s.distanceKm}km</Text>
          </View>
        );
      })}

      {/* ── Safe Camp / Shelter Markers (Interactive up to 10) ── */}
      {camps.slice(0, 10).map((camp) => {
        const mX = (lon2tile(camp.lon, zoom) - centerTileX) * 256 + width / 2 + panOffset.x;
        const mY = (lat2tile(camp.lat, zoom) - centerTileY) * 256 + height / 2 + panOffset.y;

        if (mX < -20 || mX > width + 20 || mY < -20 || mY > height + 20) return null;

        return (
          <TouchableOpacity
            key={`camp-${camp.id}`}
            style={[styles.campMarker, { left: mX - 12, top: mY - 12 }]}
            onPress={() => setSelectedCamp(camp)}
            activeOpacity={0.8}
          >
            <View style={styles.campIconWrap}>
              <ShieldCheck size={11} color="#10B981" />
            </View>
            <View style={styles.campLabelPill}>
              <Text style={styles.campLabelText} numberOfLines={1}>
                {camp.name.split(' ')[0]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── Doppler Storm Cells ── */}
      {doppler?.cells.map((cell) => {
        const mX = (lon2tile(cell.lon, zoom) - centerTileX) * 256 + width / 2 + panOffset.x;
        const mY = (lat2tile(cell.lat, zoom) - centerTileY) * 256 + height / 2 + panOffset.y;

        if (mX < -20 || mX > width + 20 || mY < -20 || mY > height + 20) return null;

        return (
          <View
            key={`cell-${cell.id}`}
            style={[styles.stormCellMarker, { left: mX - 14, top: mY - 14 }]}
          >
            <View style={styles.stormCellCore} />
            <View style={styles.stormCellLabel}>
              <Text style={styles.stormCellText}>{cell.id}</Text>
              <Text style={styles.stormCellEta}>ETA {cell.etaMinutes}m</Text>
            </View>
          </View>
        );
      })}

      {/* ── Map Controls (Floating Top-Right) ── */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={toggleLayer}
          activeOpacity={0.8}
        >
          <Layers size={13} color="#FFFFFF" />
          <Text style={styles.controlBtnText}>
            {layer === 'satellite' ? 'SATELLITE' : layer === 'streets' ? 'STREETS' : 'TOPO'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconControlBtn, showRadar && styles.iconControlBtnActive]}
          onPress={() => setShowRadar((v) => !v)}
          activeOpacity={0.8}
        >
          <Radar size={14} color={showRadar ? '#38BDF8' : '#FFFFFF'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconControlBtn}
          onPress={handleZoomIn}
          activeOpacity={0.8}
        >
          <Plus size={14} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconControlBtn}
          onPress={handleZoomOut}
          activeOpacity={0.8}
        >
          <Minus size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Selected Shelter Detail Card Overlay ── */}
      {selectedCamp && (
        <View style={styles.shelterOverlayCard}>
          <View style={styles.shelterCardHeader}>
            <View style={styles.shelterBadge}>
              <ShieldCheck size={11} color="#10B981" />
              <Text style={styles.shelterBadgeText}>{selectedCamp.categoryLabel.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedCamp(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.shelterCardTitle} numberOfLines={1}>{selectedCamp.name}</Text>
          <Text style={styles.shelterCardAddress} numberOfLines={1}>{selectedCamp.address}</Text>

          <View style={styles.shelterStatsRow}>
            <View style={styles.shelterStat}>
              <Text style={styles.shelterStatVal}>{selectedCamp.distanceKm} km</Text>
              <Text style={styles.shelterStatLabel}>DISTANCE</Text>
            </View>
            <View style={styles.shelterStatDivider} />
            <View style={styles.shelterStat}>
              <Text style={styles.shelterStatVal}>{selectedCamp.walkingTimeMin} min</Text>
              <Text style={styles.shelterStatLabel}>WALK TIME</Text>
            </View>
            <View style={styles.shelterStatDivider} />
            <View style={styles.shelterStat}>
              <Text style={styles.shelterStatVal}>+{selectedCamp.elevationGainM}m</Text>
              <Text style={styles.shelterStatLabel}>ELEVATION</Text>
            </View>
          </View>

          <View style={styles.shelterActions}>
            <TouchableOpacity
              style={styles.shelterNavBtn}
              onPress={() => Linking.openURL(selectedCamp.navigationUrl).catch(() => {})}
              activeOpacity={0.8}
            >
              <Navigation size={12} color="#0B1220" />
              <Text style={styles.shelterNavBtnText}>Navigate to Safe Camp</Text>
            </TouchableOpacity>

            {selectedCamp.emergencyPhone && (
              <TouchableOpacity
                style={styles.shelterCallBtn}
                onPress={() => Linking.openURL(`tel:${selectedCamp.emergencyPhone}`).catch(() => {})}
                activeOpacity={0.8}
              >
                <Phone size={12} color={COLORS.safe} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Recenter Button & Map Attribution (Floating Bottom) ── */}
      <View style={styles.bottomBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.osmBadge}>
            <Text style={styles.osmText}>
              {layer === 'streets' ? '© Esri Streets' : layer === 'topo' ? '© Esri Topo' : '© Esri Satellite'}
            </Text>
          </View>
          {showRadar && (
            <TouchableOpacity
              style={styles.radarBadge}
              onPress={() => {
                if (zoom > 7) setZoom(7);
              }}
              activeOpacity={zoom > 7 ? 0.7 : 1}
            >
              <View style={[styles.radarBadgeDot, zoom > 7 && { backgroundColor: COLORS.warning }]} />
              <Text style={styles.radarBadgeText}>
                {zoom > 7 ? 'RADAR · TAP (Z≤7)' : `RADAR ${frameTimeStr ? `· ${frameTimeStr}` : '· LIVE'}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.recenterBtn}
          onPress={() => {
            setPanOffset({ x: 0, y: 0 });
            if (onRecenter) onRecenter();
          }}
          activeOpacity={0.8}
        >
          <Navigation size={11} color="#FFFFFF" />
          <Text style={styles.recenterText}>Recenter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#09090B',
    borderRadius: RADII['2xl'],
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'center',
    ...SHADOWS.lg,
  },
  tileCanvas: {
    ...StyleSheet.absoluteFillObject,
  },
  tileImage: {
    position: 'absolute',
    backgroundColor: '#09090B',
  },
  radarTile: {
    opacity: 0.68,
  },
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADII['2xl'],
  },

  // ── GPS Center Pin ──
  centerPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  gpsPulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.40)',
  },
  gpsCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gpsInnerCore: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  youBadge: {
    position: 'absolute',
    bottom: -13,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  youBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },

  // ── Strike Marker ──
  strikeMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 40,
  },
  strikeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  strikeDistText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#F87171',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 3,
    borderRadius: 2,
    marginTop: 1,
  },

  // ── Camp Marker ──
  campMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 35,
  },
  campIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campLabelPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginTop: 1,
  },
  campLabelText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#34D399',
  },

  // ── Storm Cell ──
  stormCellMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 30,
  },
  stormCellCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  stormCellLabel: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 2,
  },
  stormCellText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#F59E0B',
  },
  stormCellEta: {
    fontSize: 7,
    color: '#FCD34D',
    fontFamily: FONTS.mono,
  },

  // ── Controls ──
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
    zIndex: 60,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 22, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  controlBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  iconControlBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(18, 18, 22, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-end',
  },
  iconControlBtnActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  radarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.50)',
  },
  radarBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38BDF8',
  },
  radarBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#38BDF8',
    fontFamily: FONTS.mono,
    letterSpacing: 0.5,
  },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 60,
  },
  osmBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  osmText: {
    fontSize: 8,
    color: COLORS.textTertiary,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 22, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  recenterText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Hint Banner ──
  mapHintBanner: {
    position: 'absolute',
    top: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11, 18, 32, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    zIndex: 60,
  },
  mapHintText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },

  // ── Selected Shelter Detail Card Overlay ──
  shelterOverlayCard: {
    position: 'absolute',
    bottom: 38,
    left: 10,
    right: 10,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F2E45',
    padding: 12,
    zIndex: 70,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  shelterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shelterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  shelterBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  shelterCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  shelterCardAddress: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 1,
    marginBottom: 8,
  },
  shelterStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  shelterStat: {
    alignItems: 'center',
  },
  shelterStatVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  shelterStatLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  shelterStatDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shelterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shelterNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  shelterNavBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0B1220',
  },
  shelterCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
});
