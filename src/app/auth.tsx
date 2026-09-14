import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function AuthScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError("");
    try {
      if (tab === "signin") {
        await login(email, password);
      } else {
        await register({ username, email, password, region });
      }
      router.replace("/(tabs)");
    } catch {
      setError(tab === "signin" ? "Invalid email or password." : "Could not create account. Username/email may already be taken.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>VoiceUp</Text>
        <Text style={styles.headline}>Welcome to VoiceUp</Text>
        <Text style={styles.subhead}>
          Amplify collective consumer power and hold organizations accountable with public backing.
        </Text>

        <View style={styles.segment}>
          <Pressable style={[styles.segmentBtn, tab === "signin" && styles.segmentBtnActive]} onPress={() => setTab("signin")}>
            <Text style={[styles.segmentText, tab === "signin" && styles.segmentTextActive]}>Sign In</Text>
          </Pressable>
          <Pressable style={[styles.segmentBtn, tab === "register" && styles.segmentBtnActive]} onPress={() => setTab("register")}>
            <Text style={[styles.segmentText, tab === "register" && styles.segmentTextActive]}>Create Account</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          {tab === "register" && (
            <>
              <TextField icon="person" placeholder="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
              <TextField icon="pin-drop" placeholder="Region / city" value={region} onChangeText={setRegion} />
            </>
          )}
          <TextField icon="mail" placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextField icon="lock" placeholder="Password (min. 8 characters)" secureTextEntry value={password} onChangeText={setPassword} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? "Please wait..." : tab === "signin" ? "Log in" : "Continue to VoiceUp"}
            onPress={onSubmit}
            loading={loading}
            disabled={!email || !password || (tab === "register" && !username)}
          />
        </View>

        <Pressable onPress={() => router.back()} style={styles.skip}>
          <Text style={styles.skipText}>Continue browsing without an account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: 20, paddingBottom: 40 },
  brand: { fontSize: 15, fontWeight: "700", color: Colors.secondary, textTransform: "uppercase", letterSpacing: 1 },
  headline: { fontSize: 28, fontWeight: "700", color: Colors.onSurface, marginTop: 8 },
  subhead: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 6, lineHeight: 20 },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    padding: 4,
    marginTop: 24,
  },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  segmentBtnActive: { backgroundColor: Colors.surfaceContainerLowest },
  segmentText: { fontSize: 14, fontWeight: "600", color: Colors.onSurfaceVariant },
  segmentTextActive: { color: Colors.onSurface },
  form: { marginTop: 20, gap: 14 },
  error: { color: Colors.onErrorContainer, fontSize: 13 },
  skip: { marginTop: 24, alignItems: "center" },
  skipText: { color: Colors.secondary, fontWeight: "600", fontSize: 13 },
});
