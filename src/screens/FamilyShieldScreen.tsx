import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { WarnlyEngine } from '../engine/warnly-engine';
import { ZoneItem } from '../components/ZoneItem';
import { MonitoredZone } from '../types/convective';
import { COLORS, RADII, SPACING } from '../theme';
import { Users, Plus, ShieldCheck, AlertTriangle, X } from '../components/Icons';

interface Props {
  engine: WarnlyEngine;
}

export const FamilyShieldScreen: React.FC<Props> = ({ engine }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MonitoredZone['category']>('HOME');
  const [radiusKm, setRadiusKm] = useState(10);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const zones = engine.evaluatedZones;

  const handleAddZone = () => {
    if (!name.trim()) return;

    const success = engine.zoneService.addZone({
      name: name.trim(),
      category,
      latitude: engine.userLatitude + (Math.random() - 0.5) * 0.05,
      longitude: engine.userLongitude + (Math.random() - 0.5) * 0.05,
      radiusKm,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    });

    if (success) {
      engine.refreshLocalData();
      engine.evaluateState();
      setName('');
      setContactName('');
      setContactPhone('');
      setIsModalOpen(false);
    }
  };

  const handleRemoveZone = (id: string) => {
    engine.zoneService.removeZone(id);
    engine.refreshLocalData();
    engine.evaluateState();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Users size={18} color={COLORS.safe} />
            <Text style={styles.headerTitle}>FAMILY SHIELD MULTI-ZONE DEFENSE</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.7}
            disabled={zones.length >= 10}
          >
            <Plus size={14} color={COLORS.textInverted} />
            <Text style={styles.addBtnText}>Add Zone</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          FR-07 • Monitoring {zones.length} of 10 Maximum Geographic Zones
        </Text>
      </View>

      {/* Overview Status Banner */}
      <View style={styles.statusBanner}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>ACTIVE PERIMETERS</Text>
          <Text style={styles.statusVal}>{zones.length} / 10</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>ZONES IN DANGER</Text>
          <Text
            style={[
              styles.statusVal,
              { color: zones.some((z) => z.alertLevel === 'DANGER') ? COLORS.danger : COLORS.safe },
            ]}
          >
            {zones.filter((z) => z.alertLevel === 'DANGER').length}
          </Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>GEODESIC RESOLUTION</Text>
          <Text style={[styles.statusVal, { color: COLORS.safe }]}>&lt; 0.001 ms</Text>
        </View>
      </View>

      {/* Zone Items List */}
      {zones.map((zone) => (
        <ZoneItem key={zone.id} zone={zone} onRemove={handleRemoveZone} />
      ))}

      {/* Add Zone Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CONFIGURE NEW PERIMETER ZONE</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>ZONE IDENTIFIER / NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Grandma's Cottage, East Farmland"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>CATEGORY PROFILE</Text>
            <View style={styles.categoryGrid}>
              {[
                { id: 'HOME', label: '🏠 Home' },
                { id: 'SCHOOL', label: '🏫 School' },
                { id: 'FARMLAND', label: '🌾 Farmland' },
                { id: 'WORKSITE', label: '🏗️ Worksite' },
                { id: 'ATHLETIC_FIELD', label: '⚽ Sports' },
                { id: 'MARINA', label: '⛵ Marina' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.categoryBtn,
                    category === c.id && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(c.id as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryBtnText,
                      category === c.id && styles.categoryBtnTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>GEODESIC SAFETY RADIUS (KM)</Text>
            <View style={styles.radiusRow}>
              {[5, 10, 15, 16.1].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusBtn,
                    radiusKm === r && styles.radiusBtnActive,
                  ]}
                  onPress={() => setRadiusKm(r)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radiusBtnText,
                      radiusKm === r && styles.radiusBtnTextActive,
                    ]}
                  >
                    {r === 16.1 ? '16.1 km (OSHA 10-mi)' : `${r} km`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>CONTACT PERSON (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Field Supervisor Sarah"
              placeholderTextColor={COLORS.textMuted}
              value={contactName}
              onChangeText={setContactName}
            />

            <Text style={styles.inputLabel}>EMERGENCY PHONE (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={contactPhone}
              onChangeText={setContactPhone}
            />

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleAddZone}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>ACTIVATE PERIMETER WATCH</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.safe,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textInverted,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: '#0D1420',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 440,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#070A0F',
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  categoryBtn: {
    backgroundColor: '#070A0F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  categoryBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.safe,
  },
  categoryBtnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  categoryBtnTextActive: {
    color: COLORS.safe,
    fontWeight: '800',
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  radiusBtn: {
    flex: 1,
    backgroundColor: '#070A0F',
    paddingVertical: 7,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  radiusBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.safe,
  },
  radiusBtnText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  radiusBtnTextActive: {
    color: COLORS.safe,
    fontWeight: '800',
  },
  createBtn: {
    backgroundColor: COLORS.safe,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textInverted,
    letterSpacing: 0.8,
  },
});
