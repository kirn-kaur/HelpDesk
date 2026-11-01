import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, initializeCsrf } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    initializeCsrf()
      .then(() =>
        api
          .get("/auth/me")
          .then(({ data }) => setUser(data.data))
          .catch(() => setUser(null)),
      )
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(
    () => ({
      user,
      loading,
      async login(values) {
        const { data } = await api.post("/auth/login", values);
        setUser(data.data);
        return data.data;
      },
      async register(values) {
        const { data } = await api.post("/auth/register", values);
        setUser(data.data);
        return data.data;
      },
      async logout() {
        try {
          await api.post("/auth/logout");
        } finally {
          setUser(null);
        }
      },
    }),
    [user, loading],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
