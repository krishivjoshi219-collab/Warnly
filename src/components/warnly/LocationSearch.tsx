import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, Navigation, X, MapPin, ChevronRight } from '../Icons';
import { searchLocations, type SearchResult } from '../../lib/warnly/weather';
import type { Coords } from '../../lib/warnly/types';
import { COLORS, RADII, FONTS } from '../../theme';

interface Props {
  onSelectCoords: (coords: Coords) => void;
  onUseGPS: () => void;
  locating?: boolean;
}

export const LocationSearch: React.FC<Props> = ({
  onSelectCoords,
  onUseGPS,
  locating,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchLocations(query).then((res) => {
        setResults(res);
        setLoading(false);
        setIsOpen(true);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    onSelectCoords({ lat: item.latitude, lon: item.longitude });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Search Bar ── */}
      <View style={[styles.searchBar, isOpen && styles.searchBarOpen]}>
        <Search size={14} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(t) => { setQuery(t); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any city, district or location…"
          placeholderTextColor={COLORS.textMuted}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={COLORS.safe} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={13} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        <View style={styles.divider} />
        <TouchableOpacity
          style={[styles.gpsBtn, locating && styles.gpsBtnLoading]}
          onPress={() => { onUseGPS(); setQuery(''); setIsOpen(false); }}
          disabled={locating}
          activeOpacity={0.8}
        >
          {locating ? (
            <ActivityIndicator size="small" color={COLORS.safe} />
          ) : (
            <Navigation size={11} color={COLORS.safe} />
          )}
          <Text style={styles.gpsBtnText}>GPS</Text>
        </TouchableOpacity>
      </View>

      {/* ── Dropdown Results ── */}
      {isOpen && (
        <View style={styles.dropdown}>
          {query.trim().length < 2 ? (
            <>
              <TouchableOpacity
                style={styles.gpsBanner}
                onPress={() => { setIsOpen(false); onUseGPS(); }}
                activeOpacity={0.8}
              >
                <View style={styles.gpsBannerIcon}>
                  <Navigation size={13} color={COLORS.safe} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.gpsBannerTitle}>Use Hardware Satellite GPS</Text>
                  <Text style={styles.gpsBannerSub}>Offline telemetry • Direct sensor fix</Text>
                </View>
                <ChevronRight size={13} color={COLORS.textTertiary} />
              </TouchableOpacity>

              <View style={styles.globalHintBox}>
                <MapPin size={13} color={COLORS.primary} />
                <Text style={styles.globalHintText}>
                  Type any city, town, or coordinates worldwide to retrieve live radar, atmospheric telemetry, and safe shelters.
                </Text>
              </View>
            </>
          ) : results.length > 0 ? (
            results.map((item, i) => {
              const subtitle = [item.admin1, item.country].filter(Boolean).join(', ');
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    i < results.length - 1 && styles.dropdownItemBorder,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownItemIcon}>
                    <MapPin size={11} color={COLORS.safe} />
                  </View>
                  <View style={styles.dropdownItemText}>
                    <Text style={styles.dropdownItemTitle}>{item.name}</Text>
                    {subtitle && <Text style={styles.dropdownItemSub}>{subtitle}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : !loading ? (
            <View style={styles.emptyResults}>
              <Text style={styles.emptyResultsText}>No matching locations found. Try checking the spelling.</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchBarOpen: {
    borderColor: COLORS.borderLight,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
    paddingVertical: 0,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    borderRadius: RADII.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  gpsBtnLoading: {
    opacity: 0.6,
  },
  gpsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.safe,
    fontFamily: FONTS.mono,
    letterSpacing: 0.4,
  },

  // ── Dropdown ──
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#0C131F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 300,
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  gpsBannerIcon: {
    width: 28,
    height: 28,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gpsBannerSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  globalHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  globalHintText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemIcon: {
    width: 24,
    height: 24,
    borderRadius: RADII.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  dropdownItemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  emptyResults: {
    padding: 16,
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
