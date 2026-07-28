import { useState, useEffect, useRef } from "react";
import API from "../api";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("ai"); // "ai" or "whatsapp"
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! I am your Olive Seeds design assistant. I can recommend engraving templates, estimate shipping times, or format custom request text before routing you to our workshop. We accept debit/credit cards, UPI, netbanking via Razorpay, and global currencies via PayPal securely. What are you looking to customize?" }
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Scroll to bottom on history change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, open]);

  // Listen to custom global events to open chat with prefilled text
  useEffect(() => {
    const handleOpenChat = (e) => {
      const text = e.detail?.text || "";
      if (text) {
        setOpen(true);
        setMode("ai");
        setChatHistory(prev => [
          ...prev,
          { sender: "user", text },
          { sender: "bot", text: `I see you are interested in customization! Here is a starting template for your custom request: "${text}". Let me know if you would like to edit it or proceed directly to our workshop chat!` }
        ]);
      } else {
        setOpen(true);
      }
    };

    window.addEventListener("open-whatsapp-chat", handleOpenChat);
    return () => {
      window.removeEventListener("open-whatsapp-chat", handleOpenChat);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userText = message;
    setMessage("");
    setChatHistory(prev => [...prev, { sender: "user", text: userText }]);

    if (mode === "whatsapp") {
      const phone = "919442943394"; // Updated target WhatsApp phone number
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(userText)}`;
      window.open(url, "_blank");
      setOpen(false);
      return;
    }

    // AI Mode simulation (using backend fallback or standard responsive LLM catalog matcher)
    setLoading(true);
    try {
      // Direct call to search catalog or products matching user text
      const lower = userText.toLowerCase().trim();
      let responseText = "";

      if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey") || lower.includes("greetings")) {
        responseText = "Hello there! I'm your Olive Seeds design assistant. How can I help you customize your physical crafts or digital systems today?";
      } else if (lower.includes("wood") || lower.includes("teak") || lower.includes("plaque")) {
        responseText = "We specialize in custom wood engravings! We craft custom Teakwood nameplates, wedding keepsake frames, and customized plaques. Would you like me to prepare an inquiry to send directly to our WhatsApp workshop team?";
      } else if (lower.includes("acrylic") || lower.includes("glass")) {
        responseText = "Our optical acrylic pieces are polished with high precision and laser etched for crisp corporate logos or wedding blocks. I can package this requirement and route you to WhatsApp anytime.";
      } else if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("days") || lower.includes("time")) {
        responseText = "We ship worldwide (USA, UK, Canada, Australia, Singapore, Europe, etc.). Laser engraving takes 2-4 business days, and delivery takes about 7-14 business days. Would you like to connect with a shipping agent via WhatsApp?";
      } else if (lower.includes("bulk") || lower.includes("corporate") || lower.includes("wholesale") || lower.includes("quantity")) {
        responseText = "We support corporate volume orders and bulk custom engraving! You can check our personalization workflows, materials, and fill out our dedicated query form on our Engraving Solutions page (/engraving). Would you like to review that?";
      } else if (lower.includes("engrav") || lower.includes("how it works") || lower.includes("material")) {
        responseText = "To read all about our precision engraving specifications (Wood, Acrylic, Leather, Glass, MDF) and customization journey, feel free to visit our dedicated Engraving Solutions page (/engraving).";
      } else if (lower.includes("currency") || lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
        responseText = "We display prices in local currency automatically using geo-location detection. Physical nameplates start at ₹1,299, acrylic designs at ₹1,999, and digital assets start at ₹499. Do you have a specific product in mind?";
      } else if (lower.includes("who are you") || lower.includes("name") || lower.includes("bot")) {
        responseText = "I'm the Olive Seeds Design Studio AI assistant! I'm here to guide you through our collections and help prepare customization drafts.";
      } else if (lower.includes("refund") || lower.includes("return") || lower.includes("cancel")) {
        responseText = "For custom engraved physical items, returns aren't supported once processed, but we share a design mockup proof with you before engraving. Digital products are instant downloads and non-refundable.";
      } else {
        // Highly contextual fallback helper to avoid repetition
        const sanitized = userText.length > 50 ? userText.slice(0, 47) + "..." : userText;
        responseText = `I'd love to assist you with "${sanitized}"! Could you clarify if you are interested in a custom physical engraving (like wood or acrylic nameplates) or one of our digital workspace templates? I can also package this directly as a WhatsApp draft.`;
      }

      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: "bot", text: responseText }]);
        setLoading(false);
      }, 750);

    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "bot", text: "I apologize, our design system indexer is offline. Would you like to switch to direct WhatsApp mode to chat with our live workshop agents?" }]);
      setLoading(false);
    }
  };

  const handleRouteToWhatsApp = () => {
    // Collect last user prompts or default template
    const lastUserMsg = chatHistory.filter(c => c.sender === "user").pop()?.text || "Hi Olive Seeds, I would like to design a custom product.";
    const phone = "919442943394";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lastUserMsg)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-[#0D1512] hover:bg-emerald-800 text-white rounded-full shadow-2xl transition duration-300 transform hover:scale-105 active:scale-95 cursor-pointer relative group"
          title="Olive Seeds AI Assistant"
        >
          {/* Avatar Image representation */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-700 flex items-center justify-center border border-emerald-400">
            <img 
              src="/assistant_avatar.png" 
              alt="AI Assistant Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute right-full mr-3 bg-stone-900 text-white text-xs py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            Ask AI Assistant
          </span>
        </button>
      )}

      {/* Embedded Chat Modal */}
      {open && (
        <div className="w-80 sm:w-96 bg-[#FAF9F6] border border-stone-200 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
          {/* Header */}
          <div className="bg-[#0D1512] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-400">
                <img 
                  src="/assistant_avatar.png" 
                  alt="AI Assistant Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-black tracking-wide">Olive Seeds AI Assistant</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Online • Product Expert
                </div>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-white transition text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* Mode Selector */}
          <div className="bg-stone-100 p-1 flex border-b border-stone-200">
            <button 
              onClick={() => setMode("ai")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${mode === "ai" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
            >
              👩‍💼 Ask Assistant
            </button>
            <button 
              onClick={() => setMode("whatsapp")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${mode === "whatsapp" ? "bg-emerald-600 text-white shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
            >
              💬 WhatsApp Direct
            </button>
          </div>

          {/* Chat area */}
          <div 
            ref={scrollRef}
            className="p-4 flex-1 bg-stone-50 max-h-72 overflow-y-auto flex flex-col gap-3 min-h-[220px]"
          >
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-3 text-xs leading-relaxed max-w-[85%] ${msg.sender === "user" ? "bg-[#0D1512] text-white self-end" : "bg-[#E5DED6] text-[#0D1512] self-start"}`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bg-[#E5DED6] text-[#0D1512] rounded-2xl p-3 text-xs self-start flex items-center gap-1">
                <span className="w-1 h-1 bg-stone-650 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-stone-650 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-1 bg-stone-650 rounded-full animate-bounce delay-150" />
              </div>
            )}
          </div>

          {/* Connect to WhatsApp shortcut in AI mode */}
          {mode === "ai" && chatHistory.length > 1 && (
            <div className="bg-emerald-50 p-2.5 border-t border-emerald-100 flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-bold">Ready to consult workshop?</span>
              <button 
                onClick={handleRouteToWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md transition"
              >
                📲 Route to WhatsApp
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-150 flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={mode === "ai" ? "Ask AI about materials, prices..." : "Type message for WhatsApp..."}
              className="flex-1 bg-stone-100 border border-stone-250 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${mode === "whatsapp" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-[#0D1512] hover:bg-stone-800 text-white"}`}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
