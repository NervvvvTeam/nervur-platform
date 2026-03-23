import { useCallback } from "react";
import { useAuth } from "./useAuth";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(async (path, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${API}${path}`, { ...options, headers });

    if (res.status === 401) {
      logout();
      throw new Error("Session expirée");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur serveur");
    return data;
  }, [token, logout]);

  const get = useCallback((path) => request(path), [request]);

  const post = useCallback((path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }), [request]);

  const put = useCallback((path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }), [request]);

  const del = useCallback((path) =>
    request(path, { method: "DELETE" }), [request]);

  return { get, post, put, del };
}
