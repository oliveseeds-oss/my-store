import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { 
  MdRssFeed, MdContentCopy, MdOpenInNew, MdRefresh, MdCheckCircle,
  MdShoppingCart, MdStorefront, MdOutlineShare, MdSearch
} from "react-icons/md";

export default function FeedManager() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const siteUrl = (process.env.REACT_APP_SITE_URL || window.location.origin).replace(/\/$/, "");

  const feeds = [
    {
      key: "google",
      name: "Google Shopping Feed",
      icon: <MdShoppingCart className="text-emerald-600 text-2xl" />,
      url: `${siteUrl}/feeds/google-shopping.xml`,
      platform: "Google Merchant Center",
      instructions: [
        "Go to merchants.google.com and sign in or create a free Merchant Center account.",
        "Verify your website domain ownership.",
        "Go to Products → Feeds → Add Feed.",
        "Choose 'Scheduled Fetch' and paste your feed URL.",
        "Set fetch frequency to Daily."
      ]
    },
    {
      key: "pinterest",
      name: "Pinterest Product Catalog Feed",
      icon: <MdOutlineShare className="text-rose-600 text-2xl" />,
      url: `${siteUrl}/feeds/pinterest.xml`,
      platform: "Pinterest Business",
      instructions: [
        "Go to business.pinterest.com and create a free Business account.",
        "Go to Catalogs → Add catalog.",
        "Paste your feed URL: " + siteUrl + "/feeds/pinterest.xml",
        "Pinterest will auto-create shoppable pins for all physical products."
      ]
    },
    {
      key: "facebook",
      name: "Facebook & Instagram Catalog Feed",
      icon: <MdStorefront className="text-[#1877F2] text-2xl" />,
      url: `${siteUrl}/feeds/facebook.xml`,
      platform: "Meta Commerce Manager",
      instructions: [
        "Go to business.facebook.com → Commerce Manager.",
        "Create a catalog → Choose 'E-commerce'.",
        "Add data source → Use feed URL.",
        "Paste your feed URL and connect catalog to Instagram Shopping."
      ]
    },
    {
      key: "bing",
      name: "Bing Shopping Feed",
      icon: <MdSearch className="text-cyan-600 text-2xl" />,
      url: `${siteUrl}/feeds/bing.xml`,
      platform: "Bing Places & Merchant Center",
      instructions: [
        "Go to bingplaces.com → Merchant Center.",
        "Create account and verify domain.",
        "Add feed URL: " + siteUrl + "/feeds/bing.xml"
      ]
    }
  ];

  const fetchStatus = async () => {
    try {
      const res = await API.get("/feeds/status/all");
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to load feed status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await API.post("/feeds/regenerate");
      await fetchStatus();
      alert("All product feeds regenerated successfully!");
    } catch (err) {
      console.error("Failed to regenerate feeds:", err);
      alert("Failed to regenerate feeds.");
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatTime = (ts) => {
    if (!ts) return "Not generated yet";
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Product Feeds" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MdRssFeed className="text-amber-600 text-2xl" /> Product Feed Manager
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Auto-updating RSS & XML shopping feeds for Google Shopping, Pinterest, Meta, and Bing Merchant Centers.
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
            >
              <MdRefresh className={`text-base ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Regenerating..." : "Force Regenerate Feeds"}
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {feeds.map((f) => {
              const feedInfo = status ? status[f.key] : null;
              const isCopied = copiedKey === f.key;

              return (
                <div key={f.key} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                          {f.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{f.name}</h3>
                          <span className="text-[10px] text-gray-400 font-mono">{f.platform}</span>
                        </div>
                      </div>

                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                        {loading ? "..." : (feedInfo?.count || 0)} Products
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-stone-700 overflow-x-auto">
                      <span className="truncate mr-2">{f.url}</span>
                    </div>

                    <div className="text-[11px] text-gray-400">
                      Last Generated: <strong className="text-gray-600">{loading ? "Loading..." : formatTime(feedInfo?.timestamp)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => copyToClipboard(f.url, f.key)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold py-2 rounded-xl transition"
                    >
                      {isCopied ? <MdCheckCircle className="text-emerald-600 text-base" /> : <MdContentCopy className="text-base" />}
                      {isCopied ? "Copied URL!" : "Copy Feed URL"}
                    </button>

                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                      title="Open Feed XML"
                    >
                      <MdOpenInNew className="text-lg" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Instructions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-stone-100 pb-3">
              📋 Shopping Platform Submission Instructions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700">
              {feeds.map((f) => (
                <div key={`inst-${f.key}`} className="space-y-2 bg-stone-50/70 p-4 rounded-xl border border-stone-200/60">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                    {f.name}
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-gray-600">
                    {f.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
