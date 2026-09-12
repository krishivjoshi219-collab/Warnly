import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Search, Navigation, X, MapPin } from '../Icons';
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
      setIsOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchLocations(query).then((res) => {
        setResults(res);
        setLoading(false);
        setIsOpen(res.length > 0);
      });
    }, 350);
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
          onChangeText={setQuery}
          placeholder="Search city, place or region…"
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
      {isOpen && results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((item, i) => {
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
          })}
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
    backgroundColor: '#0E141F',
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 9,
  },
  searchBarOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    padding: 0,
    margin: 0,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: RADII.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.22)',
  },
  gpsBtnLoading: {
    opacity: 0.7,
  },
  gpsBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.borderLight,
    borderBottomLeftRadius: RADII.xl,
    borderBottomRightRadius: RADII.xl,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
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
    borderBottomColor: COLORS.border,
  },
  dropdownItemIcon: {
    width: 26,
    height: 26,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.safeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownItemSub: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
});
