import axios, { AxiosError } from "axios";

const TOKEN_KEY = "auth_token";

function getAccessTokenFromResponse(data: unknown) {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (d.data && typeof d.data === "object") {
    const dd = d.data as Record<string, unknown>;
    if (typeof dd.accessToken === "string") return dd.accessToken;
  }

  if (typeof d.accessToken === "string") return d.accessToken;
  if (typeof d.token === "string") return d.token;
  return null;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? new axios.AxiosHeaders();
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const token = getAccessTokenFromResponse(response.data);
    if (typeof token === "string" && token) localStorage.setItem(TOKEN_KEY, token);
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/") window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

