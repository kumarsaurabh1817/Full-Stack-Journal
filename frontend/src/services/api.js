import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===== Auth =====
export const signUp = (data) => api.post("/auth/signup", data);
export const signIn = (data) => api.post("/auth/signin", data);

// ===== Journals =====
export const getAllJournals = () => api.get("/journals");
export const getJournalById = (id) => api.get(`/journals/${id}`);
export const createJournal = (data) => api.post("/journals", data);
export const updateJournal = (id, data) => api.put(`/journals/${id}`, data);
export const deleteJournal = (id) => api.delete(`/journals/${id}`);

export default api;
