import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Mountain,
  Waves,
  Zap,
  Activity,
  X,
  Navigation,
  ShieldCheck,
} from "../Icons";
import { SafetyCampsModal } from "./SafetyCampsModal";
import { useWarnly } from "../../lib/warnly/store";
import { COLORS, RADII, FONTS } from "../../theme";

export const DISASTER_GUIDES = {
  glof: {
    label: "GLOF (Glacial Floods)",
    color: "#00E5FF",
    leadTime: "15 to 60+ mins lead time",
    summary:
      "Glacial Lake Outburst Floods (GLOF) release millions of tons of water, boulders and ice at 35 km/h down mountain river gorges (e.g. Nepal Thame 2024 and Melamchi).",
    tips: [
      "CLIMB VERTICALLY 30 TO 50 METERS UP THE VALLEY SIDES IMMEDIATELY. Moving horizontally along the valley floor is fatal.",
      "Evacuate all low-lying riverbanks, riverbed settlements, and suspension bridges instantly without stopping to pack heavy luggage.",
      "Do NOT attempt to cross river bridges once early warning sounds — debris bridges frequently wash away.",
      "Move to designated high-ground ridges, elevated monastery grounds, or rocky outcrops away from active landslide chutes.",
      "Stay at high altitude for at least 4 to 8 hours — secondary moraine collapse surges frequently follow the initial flood wave.",
    ],
    rule: "GLOF Elevation Rule: Glacial flood waves attenuate horizontally but surge vertically in narrow mountain gorges. A vertical climb of 30+ meters above the riverbed is the single most decisive factor between life and death.",
  },
  flood: {
    label: "Flash Floods & Surges",
    color: "#38BDF8",
    leadTime: "10 to 30 mins advance warning",
    summary:
      "Rapid convective downpours and river discharge spikes can turn dry streets and river channels into lethal currents within minutes.",
    tips: [
      "Move to the highest ground reachable immediately. Never wait for floodwaters to enter your home before leaving.",
      "Turn Around, Don't Drown: 15 cm of rapid water knocks down an adult; 30 cm floats small cars; 60 cm sweeps away SUVs.",
      "Disconnect main electricity breaker and gas valves if water threatens to breach the building.",
      "Stay off culverts, storm drains, and river embankments, which erode and collapse invisibly under water pressure.",
      "Keep a waterproof emergency go-bag ready with drinking water, dry clothes, first-aid, flashlight and power bank.",
    ],
    rule: "The 15cm Water Rule: Six inches (15 cm) of swiftly flowing water will sweep you off your feet. Two feet (60 cm) will float any car or SUV. Never drive or wade through flood water.",
  },
  lightning: {
    label: "Lightning & Storms",
    color: "#FFB020",
    leadTime: "10 to 15 mins convective alert",
    summary:
      "Lightning strikes can branch 15+ km ahead of rain clouds. Direct strikes, ground currents, and side flashes carry up to 300,000 amperes.",
    tips: [
      "Follow the 30-30 rule: if thunder follows flash within 30 seconds, lightning is within 10 km — seek enclosed shelter now.",
      "Shelter inside a fully enclosed building with wiring/plumbing, or a hard-topped metal vehicle. Sheds, tents and carports are NOT safe.",
      "Never take shelter under tall, isolated trees, antennas, or metal fences.",
      "If trapped in open terrain with no shelter: crouch low on the balls of your feet, heels touching, head down, ears covered. NEVER lie flat on the ground.",
      "Stay in shelter for 30 full minutes after the last clap of thunder is heard.",
    ],
    rule: "The 30-30 Rule: Count seconds between flash and thunder. If under 30 seconds, you are in immediate danger. Wait 30 minutes after the last thunderclap before leaving shelter.",
  },
  quake: {
    label: "Earthquakes (Seismic)",
    color: "#FF2A4D",
    leadTime: "10 to 45 secs S-wave warning",
    summary:
      "Primary P-waves trigger rapid alerts seconds before destructive lateral S-waves and surface shaking hit your location.",
    tips: [
      "DROP, COVER, AND HOLD ON: drop to hands and knees, take cover under a sturdy desk or table, and hold on until shaking stops.",
      "Stay away from exterior glass windows, brick chimneys, mirrors, and unbolted tall bookshelves.",
      "If in bed, stay there and curl up, protecting your head and neck with a firm pillow.",
      "If outdoors, move into an open area away from electrical wires, brick buildings, and streetlights.",
      "After main shaking stops, expect secondary aftershocks. Evacuate buildings via stairs — NEVER use elevators.",
    ],
    rule: "Drop, Cover, and Hold On: Do not run outside while walls and glass are shaking. The majority of earthquake injuries occur from falling debris as people try to exit buildings.",
  },
} as const;

type GuideKey = keyof typeof DISASTER_GUIDES;

interface Props {
  open: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<Props> = ({ open, onClose }) => {
  const { coords } = useWarnly();
  const [active, setActive] = useState<GuideKey>("glof");
  const [campsOpen, setCampsOpen] = useState(false);

  const guide = DISASTER_GUIDES[active];

  const renderIcon = (key: GuideKey, color: string) => {
    switch (key) {
      case "glof":
        return <Mountain size={18} color={color} />;
      case "flood":
        return <Waves size={18} color={color} />;
      case "lightning":
        return <Zap size={18} color={color} />;
      case "quake":
        return <Activity size={18} color={color} />;
    }
  };

  return (
    <>
      <Modal
        visible={open}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Disaster Safety Protocols</Text>
                <Text style={styles.subtitle}>
                  Life-saving emergency steps — cached offline
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Emergency Camps Finder Bar */}
            <View style={styles.campsCallout}>
              <View style={styles.campsCalloutLeft}>
                <ShieldCheck size={18} color={COLORS.safe} />
                <View>
                  <Text style={styles.campsCalloutTitle}>Emergency Camps Finder</Text>
                  <Text style={styles.campsCalloutSubtitle}>
                    Find high-ground flood zones & hospitals
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewCampsBtn}
                onPress={() => setCampsOpen(true)}
                activeOpacity={0.8}
              >
                <Navigation size={12} color="#070A0F" />
                <Text style={styles.viewCampsBtnText}>View Camps</Text>
              </TouchableOpacity>
            </View>

            {/* Disaster Selector 2x2 Grid */}
            <View style={styles.grid}>
              {(Object.keys(DISASTER_GUIDES) as GuideKey[]).map((key) => {
                const item = DISASTER_GUIDES[key];
                const selected = key === active;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.gridBtn,
                      selected && {
                        borderColor: item.color,
                        backgroundColor: item.color + "18",
                      },
                    ]}
                    onPress={() => setActive(key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.gridBtnIconRow}>
                      {renderIcon(key, item.color)}
                    </View>
                    <Text style={styles.gridBtnLabel}>{item.label}</Text>
                    <Text style={styles.gridBtnLead}>{item.leadTime}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Guide Protocol Content */}
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentBody}
            >
              <View style={styles.guideHeader}>
                <Text style={[styles.guideTitle, { color: guide.color }]}>
                  {guide.label}
                </Text>
                <Text style={[styles.guideLeadBadge, { color: guide.color }]}>
                  ? {guide.leadTime}
                </Text>
              </View>
              <Text style={styles.summaryText}>{guide.summary}</Text>

              <Text style={styles.protocolHeader}>
                STEP-BY-STEP EVACUATION PROTOCOL
              </Text>
              <View style={styles.tipsList}>
                {guide.tips.map((tip, i) => (
                  <View key={i} style={styles.tipItem}>
                    <Text style={[styles.tipNumber, { color: guide.color }]}>
                      {i + 1}
                    </Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Core Survival Rule Card */}
              <View
                style={[
                  styles.ruleCard,
                  {
                    borderColor: guide.color + "44",
                    backgroundColor: guide.color + "10",
                  },
                ]}
              >
                <Text style={[styles.ruleTitle, { color: guide.color }]}>
                  Core Survival Rule
                </Text>
                <Text style={styles.ruleText}>{guide.rule}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SafetyCampsModal
        open={campsOpen}
        onClose={() => setCampsOpen(false)}
        coords={coords}
        preferredCategory={
          active === "glof" || active === "flood"
            ? "high_ground"
            : active === "quake"
            ? "assembly_field"
            : "shelter"
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: COLORS.safeBorder,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.full,
    padding: 6,
  },
  campsCallout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.safeBg,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  campsCalloutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  campsCalloutTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  campsCalloutSubtitle: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  viewCampsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.safe,
    borderRadius: RADII.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  viewCampsBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#070A0F",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  gridBtn: {
    width: "48%",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 4,
  },
  gridBtnIconRow: {
    marginBottom: 2,
  },
  gridBtnLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  gridBtnLead: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  contentBody: {
    paddingBottom: 24,
    gap: 10,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "900",
  },
  guideLeadBadge: {
    fontSize: 11,
    fontWeight: "700",
  },
  summaryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  protocolHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 6,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    backgroundColor: COLORS.backgroundElevated,
    borderRadius: RADII.md,
    padding: 10,
    gap: 10,
  },
  tipNumber: {
    fontSize: 13,
    fontWeight: "900",
    fontFamily: FONTS.mono,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  ruleCard: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 12,
    marginTop: 6,
  },
  ruleTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  ruleText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 4,
    lineHeight: 16,
  },
});
