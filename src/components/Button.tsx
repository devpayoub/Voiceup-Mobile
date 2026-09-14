import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { Colors } from "@/constants/colors";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ title, onPress, variant = "primary", disabled, loading }: Props) {
  const isOutline = variant === "outline";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.secondary : Colors.onSecondary} />
      ) : (
        <Text style={[styles.text, isOutline ? styles.outlineText : styles.primaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primary: { backgroundColor: Colors.secondary },
  outline: { backgroundColor: Colors.surfaceContainerLowest, borderWidth: 1, borderColor: Colors.outlineVariant },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 15, fontWeight: "700" },
  primaryText: { color: Colors.onSecondary },
  outlineText: { color: Colors.secondary },
});
