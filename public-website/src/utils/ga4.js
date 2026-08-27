// Helper module for Google Analytics 4 (Feature 10)
const GA4_ID = process.env.REACT_APP_GA4_ID || process.env.VITE_GA4_ID;

export const initGA4 = () => {
  if (!GA4_ID) return;

  if (document.getElementById("ga4-script")) return;

  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA4_ID);
};

export const trackGA4Event = (eventName, params = {}) => {
  if (!GA4_ID || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", eventName, params);
  } catch (err) {
    console.error("GA4 Event tracking error:", err);
  }
};
