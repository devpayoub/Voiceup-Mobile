import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { Colors } from "@/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: Colors.surface },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Feed", tabBarIcon: ({ color, size }) => <MaterialIcons name="local-fire-department" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="submit"
        options={{ title: "File Claim", tabBarIcon: ({ color, size }) => <MaterialIcons name="add-circle" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
