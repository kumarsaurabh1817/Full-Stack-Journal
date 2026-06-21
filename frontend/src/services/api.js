import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Token refresh state ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = []; // requests waiting for a new token

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Bridge to AuthContext helpers (set once on AuthProvider mount via setAuthHelpers).
// NOTE: _authHelpers.logout is the RAW state-cleaner (no API call) to avoid
// re-triggering the 401 interceptor from within the interceptor itself.
let _authHelpers = null;
export const setAuthHelpers = (helpers) => {
  _authHelpers = helpers;
};

// ─── Request interceptor – attach access token ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor – handle 401 with silent token refresh ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per original request.
    // Skip if it's the refresh or logout endpoint itself — force clear session.
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken =
        _authHelpers?.refreshTokenRef?.current ||
        localStorage.getItem("refreshToken");

      if (!storedRefreshToken) {
        isRefreshing = false;
        _authHelpers?.clearSession();
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/auth/refresh", {
          refreshToken: storedRefreshToken,
        });
        const newAccessToken = res.data.accessToken;

        // Persist & update React state
        localStorage.setItem("token", newAccessToken);
        _authHelpers?.updateAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        _authHelpers?.clearSession(); // clear state without hitting the API again
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===== Auth =====
export const signUp = (data) => api.post("/auth/signup", data);
export const signIn = (data) => api.post("/auth/signin", data);
export const refreshAccessToken = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });
export const logoutUser = () => api.post("/auth/logout");

// ===== Journals =====
export const getAllJournals = (page = 1, limit = 6, search = "") =>
  api.get("/journals", { params: { page, limit, ...(search ? { search } : {}) } });
export const getJournalById = (id) => api.get(`/journals/${id}`);
export const createJournal = (data) => api.post("/journals", data);
export const updateJournal = (id, data) => api.put(`/journals/${id}`, data);
export const deleteJournal = (id) => api.delete(`/journals/${id}`);

export default api;
