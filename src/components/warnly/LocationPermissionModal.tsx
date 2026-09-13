import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Navigation, MapPin, X, Shield, Radio, Search } from '../Icons';
import { COLORS, RADII, FONTS } from '../../theme';
import type { Coords } from '../../lib/warnly/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectCoords?: (coords: Coords) => void;
  onRequestHardwareGPS: () => Promise<void>;
  locating?: boolean;
}

export const LocationPermissionModal: React.FC<Props> = ({
  visible,
  onClose,
  onRequestHardwareGPS,
  locating = false,
}) => {
  const [requesting, setRequesting] = useState(false);

  const handleGrantGPS = async () => {
    setRequesting(true);
    try {
      await onRequestHardwareGPS();
      onClose();
    } catch (err) {
      console.warn('GPS request failed:', err);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconPulseRing} />
            <View style={styles.iconInner}>
              <Navigation size={26} color={COLORS.safe} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Hardware Satellite GPS</Text>
          <Text style={styles.subtitle}>
            Warnly uses direct on-device GPS hardware to pinpoint real-time lightning strikes, Doppler radar cells, and evacuation shelters worldwide without relying on internet IP.
          </Text>

          {/* Feature List */}
          <View style={styles.features}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Radio size={14} color={COLORS.safe} />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Zero-Internet Resilience: </Text>
                Direct satellite telemetry functions when cell networks fail.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Shield size={14} color="#38BDF8" />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Strike Distance: </Text>
                Calculates sub-kilometer distance to incoming electrical discharges.
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconWrap}>
                <Navigation size={14} color="#10B981" />
              </View>
              <Text style={styles.featureText}>
                <Text style={styles.featureBold}>Shelter Vectors: </Text>
                Offline compass bearings to nearest reinforced safe camps anywhere on Earth.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.primaryBtn, (requesting || locating) && styles.primaryBtnDisabled]}
            onPress={handleGrantGPS}
            disabled={requesting || locating}
            activeOpacity={0.85}
          >
            {requesting || locating ? (
              <ActivityIndicator size="small" color="#0B1220" />
            ) : (
              <>
                <Navigation size={15} color="#0B1220" />
                <Text style={styles.primaryBtnText}>Enable Hardware Satellite GPS</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Search size={13} color={COLORS.safe} />
            <Text style={styles.secondaryBtnText}>
              Search Any City or Location Manually
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2E45',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2E45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  iconPulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  iconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  features: {
    width: '100%',
    backgroundColor: '#0B1220',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureIconWrap: {
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  featureBold: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  primaryBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.safe,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B1220',
  },
  secondaryBtn: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
});
