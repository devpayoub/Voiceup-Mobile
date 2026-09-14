import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api/client";
import { relativeTime } from "@/lib/format";
import { Complaint } from "@/lib/types";

type Props = { complaint: Complaint; companyName?: string; categoryName?: string };

export default function ComplaintCard({ complaint, companyName, categoryName }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [backed, setBacked] = useState(complaint.is_backed_by_me);
  const [count, setCount] = useState(complaint.backer_count);
  const [loading, setLoading] = useState(false);
  const name = companyName || "Unknown company";

  async function toggleBack() {
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/complaints/${complaint.id}/back/`, { method: "POST" });
      const data = await res.json();
      setBacked(data.backed);
      setCount(data.backer_count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/complaint/${complaint.id}`)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={name} size={44} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.company} numberOfLines={1}>{name}</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {categoryName ? `${categoryName} • ` : ""}{complaint.region}
            </Text>
          </View>
        </View>
        <StatusBadge status={complaint.status} />
      </View>

      <Text style={styles.title} numberOfLines={2}>{complaint.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{complaint.description}</Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.countPill}>
            <MaterialIcons name="local-fire-department" size={16} color={Colors.secondary} />
            <Text style={styles.countText}>{count}</Text>
          </View>
          <Pressable onPress={toggleBack} disabled={loading} style={[styles.backBtn, backed && styles.backBtnActive]}>
            <MaterialIcons name={backed ? "check" : "add-circle"} size={15} color="#fff" />
            <Text style={styles.backBtnText}>{backed ? "Backed" : "Me Too"}</Text>
          </Pressable>
        </View>
        <View style={styles.footerRight}>
          <MaterialIcons name="schedule" size={14} color={Colors.outline} />
          <Text style={styles.metaSmall}>{relativeTime(complaint.updated_at)}</Text>
          <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.outline} style={{ marginLeft: 8 }} />
          <Text style={styles.metaSmall}>{complaint.comment_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  company: { fontSize: 15, fontWeight: "700", color: Colors.onSurface },
  meta: { fontSize: 12, color: Colors.outline, marginTop: 2 },
  title: { fontSize: 17, fontWeight: "700", color: Colors.onSurface, lineHeight: 22 },
  description: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 19 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,81,213,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  countText: { fontSize: 14, fontWeight: "700", color: Colors.onSurface },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 8,
  },
  backBtnActive: { backgroundColor: "#069669" },
  backBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  footerRight: { flexDirection: "row", alignItems: "center" },
  metaSmall: { fontSize: 12, color: Colors.outline, marginLeft: 4 },
});
