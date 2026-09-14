import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import ComplaintCard from "@/components/ComplaintCard";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { apiJson } from "@/lib/api/client";
import { memberSince } from "@/lib/format";
import { Category, Company, Complaint } from "@/lib/types";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tab, setTab] = useState<"submitted" | "backed">("submitted");

  useEffect(() => {
    if (!user) return;
    apiJson<Complaint[]>("/api/complaints/").then(setComplaints).catch(() => {});
    apiJson<Category[]>("/api/categories/").then(setCategories).catch(() => {});
    apiJson<Company[]>("/api/companies/").then(setCompanies).catch(() => {});
  }, [user]);

  const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const submitted = useMemo(() => complaints.filter((c) => c.user === user?.username), [complaints, user]);
  const backed = useMemo(() => complaints.filter((c) => c.is_backed_by_me), [complaints]);
  const list = tab === "submitted" ? submitted : backed;
  const totalBackers = useMemo(() => submitted.reduce((sum, c) => sum + c.backer_count, 0), [submitted]);
  const resolved = useMemo(() => submitted.filter((c) => c.status === "resolved").length, [submitted]);

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.gate}>
          <MaterialIcons name="account-circle" size={40} color={Colors.outline} />
          <Text style={styles.gateText}>Sign in to view your profile.</Text>
          <Button title="Sign in" onPress={() => router.push("/auth")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={list}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            <View style={styles.headerCard}>
              <View style={styles.headerTop}>
                <Avatar name={user.username} size={64} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{user.username}</Text>
                  {!!user.region && (
                    <View style={styles.metaRow}>
                      <MaterialIcons name="location-on" size={14} color={Colors.outline} />
                      <Text style={styles.metaText}>{user.region}</Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <MaterialIcons name="calendar-today" size={14} color={Colors.outline} />
                    <Text style={styles.metaText}>Joined {memberSince(user.date_joined)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{submitted.length}</Text>
                  <Text style={styles.statLabel}>Filed</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: Colors.secondary }]}>{totalBackers}</Text>
                  <Text style={styles.statLabel}>Backers</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: "#069669" }]}>{resolved}</Text>
                  <Text style={styles.statLabel}>Resolved</Text>
                </View>
              </View>

              <Pressable onPress={logout} style={styles.logoutBtn}>
                <MaterialIcons name="logout" size={16} color={Colors.onErrorContainer} />
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            </View>

            <View style={styles.segment}>
              <Pressable style={[styles.segmentBtn, tab === "submitted" && styles.segmentBtnActive]} onPress={() => setTab("submitted")}>
                <Text style={[styles.segmentText, tab === "submitted" && styles.segmentTextActive]}>Submitted ({submitted.length})</Text>
              </Pressable>
              <Pressable style={[styles.segmentBtn, tab === "backed" && styles.segmentBtnActive]} onPress={() => setTab("backed")}>
                <Text style={[styles.segmentText, tab === "backed" && styles.segmentTextActive]}>Backed ({backed.length})</Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ComplaintCard complaint={item} companyName={companyMap.get(item.company)} categoryName={categoryMap.get(item.category)} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  gateText: { fontSize: 15, color: Colors.onSurfaceVariant },
  listContent: { padding: 16, paddingBottom: 32 },
  headerCard: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, gap: 14 },
  headerTop: { flexDirection: "row", gap: 14, alignItems: "center" },
  name: { fontSize: 18, fontWeight: "700", color: Colors.onSurface },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, color: Colors.onSurfaceVariant },
  statsGrid: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: 10, padding: 10, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: Colors.onSurface },
  statLabel: { fontSize: 10, fontWeight: "700", color: Colors.onSurfaceVariant, textTransform: "uppercase", marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  logoutText: { color: Colors.onErrorContainer, fontWeight: "700", fontSize: 13 },
  segment: { flexDirection: "row", backgroundColor: Colors.surfaceContainerHigh, borderRadius: 12, padding: 4, marginTop: 16, marginBottom: 4 },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  segmentBtnActive: { backgroundColor: Colors.surfaceContainerLowest },
  segmentText: { fontSize: 12, fontWeight: "700", color: Colors.onSurfaceVariant },
  segmentTextActive: { color: Colors.onSurface },
  empty: { textAlign: "center", color: Colors.outline, marginTop: 24, fontSize: 14 },
});
