import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.endsWith("oliveseedsdesignstudio.com")) {
      return `${window.location.protocol}//apiosspanel.oliveseedsdesignstudio.com/api`;
    }
  }
  return "http://200.141.2.131:5000/api";
};

const API = axios.create({ baseURL: getBaseURL() });

API.interceptors.request.use((config) => {
  const member = JSON.parse(localStorage.getItem("member") || "{}");
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const token = member.token || admin.token || (typeof admin === "string" ? admin : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem("member");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
