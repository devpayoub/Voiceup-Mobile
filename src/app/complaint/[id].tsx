import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import TextField from "@/components/TextField";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, apiJson, mediaUrl } from "@/lib/api/client";
import { relativeTime } from "@/lib/format";
import { Category, Comment, Company, Complaint, Status } from "@/lib/types";

const STAGES: { status: Status; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { status: "received", label: "Complaint Filed", icon: "flag" },
  { status: "in_progress", label: "Under Review", icon: "trending-up" },
  { status: "resolved", label: "Resolved", icon: "check" },
];
const STAGE_ORDER: Record<Status, number> = { received: 0, in_progress: 1, resolved: 2 };

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [commentText, setCommentText] = useState("");
  const [backing, setBacking] = useState(false);

  function load() {
    apiJson<Complaint>(`/api/complaints/${id}/`).then(setComplaint).catch(() => {});
    apiJson<Comment[]>(`/api/complaints/${id}/comments/`).then(setComments).catch(() => {});
    apiJson<Category[]>("/api/categories/").then(setCategories).catch(() => {});
    apiJson<Company[]>("/api/companies/").then(setCompanies).catch(() => {});
  }

  useEffect(load, [id]);

  const categoryName = useMemo(() => categories.find((c) => c.id === complaint?.category)?.name, [categories, complaint]);
  const companyName = useMemo(() => companies.find((c) => c.id === complaint?.company)?.name, [companies, complaint]);

  async function toggleBack() {
    if (!user) return router.push("/auth");
    setBacking(true);
    try {
      const res = await apiFetch(`/api/complaints/${id}/back/`, { method: "POST" });
      const data = await res.json();
      setComplaint((prev) => prev && { ...prev, is_backed_by_me: data.backed, backer_count: data.backer_count });
    } finally {
      setBacking(false);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    const res = await apiFetch(`/api/complaints/${id}/comments/`, {
      method: "POST",
      body: JSON.stringify({ text: commentText }),
    });
    if (res.ok) {
      setCommentText("");
      apiJson<Comment[]>(`/api/complaints/${id}/comments/`).then(setComments);
    }
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const photo = mediaUrl(complaint.photo);
  const currentStage = STAGE_ORDER[complaint.status];

  return (
    <SafeAreaView style={styles.screen} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <StatusBadge status={complaint.status} />
        <Text style={styles.title}>{complaint.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Filed by <Text style={styles.metaStrong}>{complaint.user}</Text></Text>
          <Text style={styles.metaText}>• {relativeTime(complaint.created_at)}</Text>
        </View>
        <View style={styles.pillsRow}>
          {categoryName && <View style={styles.pill}><Text style={styles.pillText}>{categoryName}</Text></View>}
          {companyName && <View style={styles.pill}><Text style={styles.pillText}>{companyName}</Text></View>}
          <View style={styles.pill}><Text style={styles.pillText}>{complaint.region}</Text></View>
        </View>

        <View style={styles.card}>
          <View style={styles.backerRow}>
            <Text style={styles.backerCount}>{complaint.backer_count}</Text>
            <Text style={styles.backerLabel}>{complaint.backer_count === 1 ? "citizen affected" : "citizens affected"}</Text>
          </View>
          <Button
            title={complaint.is_backed_by_me ? "You backed this case" : "I have this problem too"}
            onPress={toggleBack}
            variant={complaint.is_backed_by_me ? "outline" : "primary"}
            loading={backing}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Grievance Statement</Text>
          <Text style={styles.description}>{complaint.description}</Text>
        </View>

        {photo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Documentary Evidence</Text>
            <Image source={{ uri: photo }} style={styles.photo} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resolution Status</Text>
          {STAGES.map((stage, i) => {
            const done = i < currentStage || (i === currentStage && complaint.status === "resolved");
            const active = i === currentStage && complaint.status !== "resolved";
            return (
              <View key={stage.status} style={styles.stageRow}>
                <View style={[styles.stageDot, (done || active) && styles.stageDotActive]}>
                  <MaterialIcons name={done ? "check" : stage.icon} size={12} color={done || active ? "#fff" : Colors.outline} />
                </View>
                <Text style={[styles.stageLabel, active && styles.stageLabelActive]}>{stage.label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Community Discussion ({comments.length})</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Avatar name={c.user} size={32} />
              <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentTime}>{relativeTime(c.created_at)}</Text>
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && <Text style={styles.empty}>No comments yet.</Text>}

          {user && (
            <View style={styles.commentForm}>
              <TextField placeholder="Add a comment..." value={commentText} onChangeText={setCommentText} multiline style={styles.commentInput} />
              <Button title="Post comment" onPress={submitComment} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  loading: { padding: 24, color: Colors.outline },
  content: { padding: 16, paddingBottom: 40, gap: 14 },
  title: { fontSize: 22, fontWeight: "700", color: Colors.onSurface },
  metaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  metaText: { fontSize: 12, color: Colors.onSurfaceVariant },
  metaStrong: { color: Colors.onSurface, fontWeight: "700" },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { backgroundColor: Colors.surfaceContainer, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { fontSize: 12, color: Colors.onSurface, fontWeight: "600" },
  card: { backgroundColor: Colors.surfaceContainerLowest, borderRadius: 16, padding: 16, gap: 10 },
  backerRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  backerCount: { fontSize: 26, fontWeight: "700", color: Colors.secondary },
  backerLabel: { fontSize: 15, fontWeight: "700", color: Colors.onSurface },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.onSurface },
  description: { fontSize: 14, color: Colors.onSurface, lineHeight: 21 },
  photo: { width: "100%", height: 220, borderRadius: 10 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  stageDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.surfaceContainerHighest, alignItems: "center", justifyContent: "center" },
  stageDotActive: { backgroundColor: Colors.secondary },
  stageLabel: { fontSize: 13, fontWeight: "600", color: Colors.onSurface },
  stageLabelActive: { color: Colors.secondary, fontWeight: "700" },
  commentRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  commentBubble: { flex: 1, backgroundColor: Colors.surfaceContainerLow, borderRadius: 10, padding: 10 },
  commentHeader: { flexDirection: "row", justifyContent: "space-between" },
  commentUser: { fontSize: 13, fontWeight: "700", color: Colors.onSurface },
  commentTime: { fontSize: 11, color: Colors.outline },
  commentText: { fontSize: 13, color: Colors.onSurface, marginTop: 2 },
  empty: { fontSize: 13, color: Colors.outline },
  commentForm: { gap: 8, marginTop: 6 },
  commentInput: { height: 70, paddingTop: 10, textAlignVertical: "top" },
});
