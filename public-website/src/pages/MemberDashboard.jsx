// visitorTracker.js — Call initTracker() in App.jsx once
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Generate or retrieve session ID
function getSessionId() {
  let id = sessionStorage.getItem("_vsid");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_vsid", id);
  }
  return id;
}

// Detect browser from UA
function detectBrowser(ua) {
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

// Detect OS from UA
function detectOS(ua) {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  return "Other";
}

// Detect device type
function detectDevice() {
  const w = window.innerWidth;
  if (w <= 768) return "Mobile";
  if (w <= 1024) return "Tablet";
  return "Desktop";
}

// Parse UTM params from URL
function getUtmParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source"),
    utm_medium: p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
  };
}

// Main track function
export async function trackPageView() {
  const ua = navigator.userAgent;
  const utm = getUtmParams();

  try {
    await axios.post(`${API_BASE}/visitors/track`, {
      session_id: getSessionId(),
      page: window.location.pathname + window.location.search,
      referrer: document.referrer,
      browser: detectBrowser(ua),
      os: detectOS(ua),
      device_type: detectDevice(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      ...utm,
      // Geo is resolved server-side via IP
    });
  } catch {
    // Silently fail — don't block user
  }
}

// Call once in App.jsx to auto-track on route changes
export function initTracker() {
  // Track initial page
  trackPageView();

  // Track on browser back/forward
  window.addEventListener("popstate", trackPageView);

  // Track on pushState (SPA navigation)
  const origPush = window.history.pushState.bind(window.history);
  window.history.pushState = (...args) => {
    origPush(...args);
    setTimeout(trackPageView, 100); // small delay to let URL update
  };
}