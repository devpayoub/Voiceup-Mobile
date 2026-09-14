import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ComplaintCard from "@/components/ComplaintCard";
import Logo from "@/components/Logo";
import TextField from "@/components/TextField";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { apiJson } from "@/lib/api/client";
import { categoryIcon } from "@/lib/format";
import { Category, Company, Complaint } from "@/lib/types";

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const data = await apiJson<Complaint[]>(`/api/complaints/?${params.toString()}`);
    setComplaints(data);
  }, [category, search]);

  useEffect(() => {
    apiJson<Category[]>("/api/categories/").then(setCategories).catch(() => {});
    apiJson<Company[]>("/api/companies/").then(setCompanies).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const companyMap = useMemo(() => new Map(companies.map((c) => [c.id, c.name])), [companies]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Logo size={22} />
          <View>
            <Text style={styles.brand}>VoiceUp</Text>
            <Text style={styles.headerSub}>Feed</Text>
          </View>
        </View>
        {!user && (
          <Pressable onPress={() => router.push("/auth")} style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(c) => String(c.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <TextField icon="search" placeholder="Search claims by provider or issue..." value={search} onChangeText={setSearch} style={{ marginBottom: 12 }} />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(c) => String(c.id)}
              contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
              renderItem={({ item }) => {
                const active = category === String(item.id);
                return (
                  <Pressable
                    onPress={() => setCategory(active ? "" : String(item.id))}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <MaterialIcons name={categoryIcon(item.name) as any} size={15} color={active ? "#fff" : Colors.secondary} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.name}</Text>
                  </Pressable>
                );
              }}
            />
          </>
        }
        renderItem={({ item }) => (
          <ComplaintCard complaint={item} companyName={companyMap.get(item.company)} categoryName={categoryMap.get(item.category)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No complaints match these filters yet.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 17, fontWeight: "700", color: Colors.onSurface },
  headerSub: { fontSize: 11, fontWeight: "700", color: Colors.onSurfaceVariant, textTransform: "uppercase", letterSpacing: 0.6 },
  signInBtn: { backgroundColor: Colors.secondary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  signInText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainerLow,
  },
  chipActive: { backgroundColor: Colors.secondary },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.onSurface },
  chipTextActive: { color: "#fff" },
  empty: { textAlign: "center", color: Colors.outline, marginTop: 40, fontSize: 14 },
});
