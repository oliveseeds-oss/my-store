import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.endsWith("oliveseedsdesignstudio.com")) {
      return "https://apiosspanel.oliveseedsdesignstudio.com/api";
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

// Handle 401 and 403 globally — do not force page redirects for guest users
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const url = error.config?.url || "";
      if (url.includes("/members") || url.includes("/notifications")) {
        try {
          localStorage.removeItem("member");
        } catch {}
      }
    }
    return Promise.reject(error);
  }
);

export default API;
