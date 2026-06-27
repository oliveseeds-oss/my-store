import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Attach token to every request
API.interceptors.request.use((config) => {
  try {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    const token = admin.token || admin;
    if (token && typeof token === "string") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Handle 401 and 403 globally — redirect to login (except on login requests)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith("/login");
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !isLoginRequest
    ) {
      localStorage.removeItem("admin");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;