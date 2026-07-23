import axios from "axios";

const API = axios.create({ baseURL: "http://200.141.2.131:5000/api" });

API.interceptors.request.use((config) => {
  const member = JSON.parse(localStorage.getItem("member") || "{}");
  if (member.token) config.headers.Authorization = `Bearer ${member.token}`;
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
      localStorage.removeItem("member");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
