import axios from "axios";

export const api = axios.create({ baseURL: "/api", withCredentials: true });
let csrfToken = "";

export async function initializeCsrf() {
  const { data } = await api.get("/auth/csrf");
  csrfToken = data.csrfToken;
}

api.interceptors.request.use((config) => {
  if (
    ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase()) &&
    csrfToken
  )
    config.headers["X-CSRF-Token"] = csrfToken;
  return config;
});

export function errorMessage(error) {
  return (
    error?.response?.data?.message ?? "Something went wrong. Please try again."
  );
}
