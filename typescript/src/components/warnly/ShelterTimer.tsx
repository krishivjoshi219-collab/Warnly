import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Timer } from "../Icons";
import { COLORS, FONTS, RADII } from "../../theme";

export const ShelterTimer: React.FC<{ until: number | null }> = ({ until }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!until) return null;
  const remaining = Math.max(0, until - now);
  const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const pct = Math.min(100, Math.max(0, 100 - (remaining / (30 * 60000)) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Timer size={14} color={COLORS.textSecondary} />
          <Text style={styles.labelText}>30-30 RULE COUNTDOWN</Text>
        </View>
        <Text style={styles.timerDigits}>
          {mm}:{ss}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.hintText}>
        Timer resets on every new strike inside your 10 km safety ring.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(18, 26, 39, 0.75)",
    padding: 14,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  timerDigits: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    color: COLORS.danger,
  },
  barTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.backgroundElevated,
    marginTop: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.danger,
  },
  hintText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 14,
  },
});
