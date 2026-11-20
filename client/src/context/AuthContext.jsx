import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const KEY = "geogate-demo-user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
  });

  function login(details) {
    const next = { ...details };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    setUser(next);
  }

  function logout() {
    sessionStorage.removeItem(KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
