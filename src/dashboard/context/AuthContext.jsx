import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("sentinel_token"));
  const [isLoading, setIsLoading] = useState(true);

  const hasAccess = useCallback((toolId) => {
    return subscriptions.some(s => s.toolId === toolId && s.status === "active");
  }, [subscriptions]);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }

    fetch(`${API}/api/sentinel-app/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setUser(data.user);
        setSubscriptions(data.subscriptions || []);
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("sentinel_token");
        setToken(null);
        setUser(null);
        setSubscriptions([]);
        setIsLoading(false);
      });
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/sentinel-app/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur de connexion");

    localStorage.setItem("sentinel_token", data.token);
    setToken(data.token);
    setUser(data.user);
    setSubscriptions(data.subscriptions || []);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sentinel_token");
    setToken(null);
    setUser(null);
    setSubscriptions([]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, subscriptions, isLoading, login, logout, isAuthenticated: !!user, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}
