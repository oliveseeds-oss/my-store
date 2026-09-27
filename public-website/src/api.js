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

// Handle global responses and cleanly clear dead/expired member tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errMsg = String(error.response?.data?.error || "").toLowerCase();
      if (errMsg.includes("token") || errMsg.includes("expired") || errMsg.includes("invalid")) {
        // Clear dead member session token so stale state stops breaking requests
        const currentMember = localStorage.getItem("member");
        if (currentMember) {
          try {
            const parsed = JSON.parse(currentMember);
            if (parsed.token || parsed.member?.token) {
              console.warn("Member session expired, clearing stale auth token.");
              localStorage.removeItem("member");
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("member:expired"));
              }
            }
          } catch (e) {
            localStorage.removeItem("member");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
