import { StyleSheet, Text, View } from "react-native";

import { avatarColor, initials } from "@/lib/format";

export default function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const { bg, fg } = avatarColor(name);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 3, backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg, fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700" },
});
