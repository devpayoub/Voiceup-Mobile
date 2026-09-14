import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { Colors } from "@/constants/colors";

type Props = TextInputProps & { icon?: keyof typeof MaterialIcons.glyphMap };

export default function TextField({ icon, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {icon && <MaterialIcons name={icon} size={20} color={Colors.onSurfaceVariant} style={styles.icon} />}
      <TextInput
        placeholderTextColor={Colors.outline}
        style={[styles.input, icon && styles.inputWithIcon, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative", justifyContent: "center" },
  icon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.onSurface,
  },
  inputWithIcon: { paddingLeft: 44 },
});
