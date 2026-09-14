import { clearTokens, getRefreshToken, setTokens } from "../auth";
import { apiFetch, apiJson } from "./client";

type TokenPair = { access: string; refresh: string };

export async function login(email: string, password: string): Promise<void> {
  const data = await apiJson<TokenPair>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setTokens(data.access, data.refresh);
}

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  region: string;
};

export async function register(payload: RegisterPayload): Promise<void> {
  await apiJson("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await login(payload.email, payload.password);
}

export async function logout(): Promise<void> {
  const refresh = await getRefreshToken();
  if (refresh) {
    try {
      await apiFetch("/api/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Best-effort server-side revocation; always clear the local session below.
    }
  }
  await clearTokens();
}
