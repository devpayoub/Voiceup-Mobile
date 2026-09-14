import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, apiJson } from "@/lib/api/client";
import { categoryIcon } from "@/lib/format";
import { Category, Region } from "@/lib/types";

export default function SubmitScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [category, setCategory] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiJson<Category[]>("/api/categories/").then(setCategories).catch(() => {});
    apiJson<Region[]>("/api/regions/").then(setRegions).catch(() => {});
  }, []);

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0]);
  }

  async function onSubmit() {
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("company_name", companyName);
      form.append("region", region);
      form.append("city", city);
      if (photo) {
        form.append("photo", { uri: photo.uri, name: "photo.jpg", type: "image/jpeg" } as any);
      }
      const res = await apiFetch("/api/complaints/", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setTitle(""); setDescription(""); setCompanyName(""); setRegion(""); setCity(""); setCategory(""); setPhoto(null);
      router.push(`/complaint/${created.id}`);
    } catch {
      setError("Could not submit complaint. Check the fields and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.gate}>
          <MaterialIcons name="lock" size={32} color={Colors.outline} />
          <Text style={styles.gateText}>Sign in to file a complaint.</Text>
          <Button title="Sign in" onPress={() => router.push("/auth")} />
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = category && companyName && region && title && description;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headline}>File a Public Complaint</Text>
        <Text style={styles.subhead}>Document your dispute publicly so others can back it.</Text>

        <Text style={styles.label}>Category *</Text>
        <View style={styles.grid}>
          {categories.map((c) => {
            const active = category === String(c.id);
            return (
              <Pressable key={c.id} onPress={() => setCategory(String(c.id))} style={[styles.catPill, active && styles.catPillActive]}>
                <MaterialIcons name={categoryIcon(c.name) as any} size={18} color={active ? "#fff" : Colors.secondary} />
                <Text style={[styles.catText, active && styles.catTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Company or agency *</Text>
        <TextField icon="business" placeholder="e.g. PG&E, Metro Transit" value={companyName} onChangeText={setCompanyName} />

        <Text style={styles.label}>Region *</Text>
        <TextField icon="pin-drop" placeholder="e.g. San Francisco" value={region} onChangeText={setRegion} />

        <Text style={styles.label}>City</Text>
        <TextField icon="location-city" placeholder="e.g. Mission District" value={city} onChangeText={setCity} />

        <Text style={styles.label}>Complaint headline *</Text>
        <TextField placeholder="What is the specific issue?" maxLength={90} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Details *</Text>
        <TextField
          placeholder="Include dates, impact, and reference numbers."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={styles.textarea}
        />

        <Text style={styles.label}>Evidence photo (optional)</Text>
        <Pressable onPress={pickPhoto} style={styles.upload}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.uploadPreview} />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={26} color={Colors.secondary} />
              <Text style={styles.uploadText}>Tap to attach a photo</Text>
            </>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={loading ? "Submitting..." : "Publish & Seek Backers"} onPress={onSubmit} loading={loading} disabled={!canSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 16, paddingBottom: 40, gap: 6 },
  gate: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  gateText: { fontSize: 15, color: Colors.onSurfaceVariant },
  headline: { fontSize: 22, fontWeight: "700", color: Colors.onSurface },
  subhead: { fontSize: 13, color: Colors.onSurfaceVariant, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "700", color: Colors.onSurface, marginTop: 14, marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catPill: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 12, backgroundColor: Colors.surfaceContainerLowest, width: "48%",
  },
  catPillActive: { backgroundColor: Colors.secondary },
  catText: { fontSize: 13, fontWeight: "600", color: Colors.onSurface, flexShrink: 1 },
  catTextActive: { color: "#fff" },
  textarea: { height: 110, paddingTop: 12, textAlignVertical: "top" },
  upload: {
    borderRadius: 16, backgroundColor: Colors.surfaceContainerLowest, alignItems: "center",
    justifyContent: "center", paddingVertical: 24, gap: 6, overflow: "hidden",
  },
  uploadText: { fontSize: 13, fontWeight: "600", color: Colors.onSurface },
  uploadPreview: { width: "100%", height: 160 },
  error: { color: Colors.onErrorContainer, fontSize: 13, marginTop: 10 },
});
