import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "voiceup_access";
const REFRESH_KEY = "voiceup_refresh";

// expo-secure-store has no native Keychain/Keystore equivalent on web, so its
// web build is a stub; fall back to localStorage there (same as the Next.js app).
const store = Platform.OS === "web"
  ? {
      getItemAsync: async (key: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
      setItemAsync: async (key: string, value: string) => window.localStorage.setItem(key, value),
      deleteItemAsync: async (key: string) => window.localStorage.removeItem(key),
    }
  : SecureStore;

export async function getAccessToken(): Promise<string | null> {
  return store.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return store.getItemAsync(REFRESH_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  await store.setItemAsync(ACCESS_KEY, access);
  await store.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  await store.deleteItemAsync(ACCESS_KEY);
  await store.deleteItemAsync(REFRESH_KEY);
}
