import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";
import { Status } from "@/lib/types";

const CONFIG: Record<Status, { label: string; icon: keyof typeof MaterialIcons.glyphMap; bg: string; fg: string }> = {
  received: { label: "Received", icon: "visibility", bg: Colors.surfaceContainerHigh, fg: Colors.secondary },
  in_progress: { label: "In Progress", icon: "pending", bg: "#fff4d6", fg: "#7a5900" },
  resolved: { label: "Resolved", icon: "check-circle", bg: Colors.tertiaryContainer, fg: "#85f8c4" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <MaterialIcons name={c.icon} size={13} color={c.fg} />
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
});
