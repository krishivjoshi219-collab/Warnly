import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { levelMeta } from "../../lib/warnly/risk";
import type { RiskLevel } from "../../lib/warnly/types";
import { COLORS, FONTS } from "../../theme";

interface Props {
  probability: number;
  level: RiskLevel;
  caption: string;
}

export const RiskMeter: React.FC<Props> = ({ probability, level, caption }) => {
  const meta = levelMeta[level];
  const color =
    level === "danger"
      ? COLORS.danger
      : level === "advisory"
      ? COLORS.warning
      : COLORS.safe;

  return (
    <View style={styles.container}>
      <View style={[styles.outerRing, { borderColor: color }]}>
        <View style={[styles.innerRing, { borderColor: color + "44" }]}>
          <View style={styles.valueContainer}>
            <View style={styles.numRow}>
              <Text style={[styles.probabilityText, { color }]}>
                {probability}
              </Text>
              <Text style={[styles.percentSign, { color }]}>%</Text>
            </View>
            <Text style={styles.captionText} numberOfLines={2}>
              {caption}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  outerRing: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 26, 39, 0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  innerRing: {
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  probabilityText: {
    fontSize: 54,
    fontWeight: "900",
    fontFamily: FONTS.mono,
    lineHeight: 60,
  },
  percentSign: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
    marginLeft: 2,
  },
  captionText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 15,
  },
});
