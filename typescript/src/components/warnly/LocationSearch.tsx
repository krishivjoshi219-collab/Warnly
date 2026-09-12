import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Search, Navigation, X, MapPin } from "../Icons";
import { searchLocations, type SearchResult } from "../../lib/warnly/weather";
import type { Coords } from "../../lib/warnly/types";
import { COLORS, RADII, FONTS } from "../../theme";

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
  const [query, setQuery] = useState("");
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
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchBar}>
        <Search size={15} color={COLORS.textSecondary} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search any city, place or country…"
          placeholderTextColor={COLORS.textMuted}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={COLORS.safe} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.gpsButton}
          onPress={() => {
            onUseGPS();
            setQuery("");
            setIsOpen(false);
          }}
          disabled={locating}
          activeOpacity={0.7}
        >
          <Navigation size={12} color={COLORS.safe} />
          <Text style={styles.gpsButtonText}>GPS</Text>
        </TouchableOpacity>
      </View>

      {isOpen && results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map((item) => {
            const subtitle = [item.admin1, item.country].filter(Boolean).join(", ");
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <MapPin size={13} color={COLORS.safe} />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  {subtitle ? (
                    <Text style={styles.itemSubtitle}>{subtitle}</Text>
                  ) : null}
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
    position: "relative",
    zIndex: 100,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18, 26, 39, 0.8)",
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.safeBg,
    borderRadius: RADII.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.safe,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: COLORS.card,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "60",
    gap: 8,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
