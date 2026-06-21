import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { logoutUser, setAuthHelpers } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref so the axios interceptor always has the latest refreshToken
  // without needing a re-render cycle
  const refreshTokenRef = useRef(null);

  // ── Bootstrap from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    if (savedRefreshToken) {
      setRefreshToken(savedRefreshToken);
      refreshTokenRef.current = savedRefreshToken;
    }
    setLoading(false);
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────────────

  /**
   * Called on successful sign-in.
   * @param {object} userData   { userId, email }
   * @param {string} accessToken
   * @param {string} rToken     refresh token from the server
   */
  const login = useCallback((userData, accessToken, rToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(rToken);
    refreshTokenRef.current = rToken;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", rToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  /** Called by the axios interceptor to silently swap in a new access token. */
  const updateAccessToken = useCallback((newAccessToken) => {
    setToken(newAccessToken);
    localStorage.setItem("token", newAccessToken);
  }, []);

  /**
   * Clears local session state & localStorage WITHOUT calling the API.
   * Used internally by the axios interceptor to avoid re-triggering itself.
   */
  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    refreshTokenRef.current = null;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }, []);

  /**
   * Full sign-out:
   *  1. Calls the backend logout endpoint (invalidates the refreshToken in DB).
   *  2. Clears local state & localStorage regardless of API success/failure.
   */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_) {
      // Always clear the local session even if the network request fails
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // ── Wire helpers to the axios interceptor (once on mount) ────────────────
  useEffect(() => {
    setAuthHelpers({ updateAccessToken, clearSession, refreshTokenRef });
  }, [updateAccessToken, clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        login,
        logout,
        updateAccessToken,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
