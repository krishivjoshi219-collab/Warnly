import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WarnlyEngine } from '../engine/warnly-engine';
import { ShelterCard } from '../components/ShelterCard';
import { HardenedShelter } from '../types/convective';
import { COLORS, RADII, SPACING } from '../theme';
import { Shield, MapPin, Filter, CheckCircle } from '../components/Icons';

interface Props {
  engine: WarnlyEngine;
}

export const SheltersScreen: React.FC<Props> = ({ engine }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const shelters = engine.evaluatedShelters;

  const filteredShelters =
    filterType === 'ALL'
      ? shelters
      : shelters.filter((s) => s.type === filterType);

  const selected = engine.selectedShelter || (shelters.length > 0 ? shelters[0] : null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Tactical Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={18} color={COLORS.safe} />
          <Text style={styles.headerTitle}>HARDENED EVACUATION SHELTERS</Text>
        </View>
        <Text style={styles.headerSub}>
          FR-06 • Verified Concrete Bunkers & High-Ground Shelters
        </Text>
      </View>

      {/* Offline Resilience Guarantee Banner */}
      <View style={styles.offlineBanner}>
        <CheckCircle size={15} color={COLORS.safe} />
        <Text style={styles.offlineBannerText}>
          All shelter coordinates, bearings, and walking routes are cached locally in RAM. 100% operational offline during cellular blackout.
        </Text>
      </View>

      {/* Type Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {[
          { id: 'ALL', label: 'All Shelters' },
          { id: 'CONCRETE_BUNKER', label: 'Reinforced Bunkers' },
          { id: 'SUBTERRANEAN_METRO', label: 'Subterranean Metro' },
          { id: 'COMMUNITY_CIVIL_SHELTER', label: 'Civil Defense' },
          { id: 'REINFORCED_SCHOOL', label: 'Faraday Halls' },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterPill,
              filterType === f.id && styles.filterPillActive,
            ]}
            onPress={() => setFilterType(f.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                filterType === f.id && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shelters List */}
      {filteredShelters.map((shelter) => {
        const isSelected = selected?.id === shelter.id;
        const directions = engine.shelterService.getOfflineDirections(
          shelter,
          0 // 0 deg user heading baseline
        );

        return (
          <ShelterCard
            key={shelter.id}
            shelter={shelter}
            isSelected={isSelected}
            onSelect={(s) => engine.selectShelter(s)}
            offlineDirections={directions}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 80,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  offlineBannerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
  },
  filterPill: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.safe,
  },
  filterText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.safe,
    fontWeight: '800',
  },
});
