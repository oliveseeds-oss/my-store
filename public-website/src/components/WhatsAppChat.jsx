import { useState, useEffect, useRef } from "react";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("ai"); // "ai" or "whatsapp"
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Welcome to Olive Seeds Design Studio. I am your studio concierge. I can recommend bespoke design objects, provide production timelines, or assist in preparing commission briefs for our design team. What kind of project are you looking to create?" }
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
          { sender: "bot", text: `Thank you for specifying your requirements. Here is a starting brief for your commission: "${text}". Let us know if you wish to refine this or proceed directly to our studio consultation.` }
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
        responseText = "Good day. I am the Olive Seeds studio concierge. How may I assist you with our bespoke commissions, corporate gifting, or digital design suites today?";
      } else if (lower.includes("wood") || lower.includes("teak") || lower.includes("plaque")) {
        responseText = "We specialise in hand-finished timber objects and bespoke commissions, crafting architectural teakwood pieces, ceremonial keepsakes, and executive plaques. Would you like to prepare an enquiry for our studio team?";
      } else if (lower.includes("acrylic") || lower.includes("glass")) {
        responseText = "Our architectural acrylic pieces are finished with precision and tailored for corporate insignia or ceremonial recognition. I can structure your brief and connect you with our studio team.";
      } else if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("days") || lower.includes("time")) {
        responseText = "We dispatch worldwide, including the United Kingdom, United States, Australia, Europe, and Asia-Pacific. Standard bespoke production requires 10 to 15 business days, with transit taking approximately seven to 14 business days. Would you like to consult our team directly?";
      } else if (lower.includes("bulk") || lower.includes("corporate") || lower.includes("wholesale") || lower.includes("quantity")) {
        responseText = "We regularly fulfil corporate volume commissions and bespoke orders. You may explore our material specifications and complete an initial brief on our Bespoke Objects page (/engraving). Would you like to proceed there?";
      } else if (lower.includes("engrav") || lower.includes("how it works") || lower.includes("material")) {
        responseText = "To explore our material specifications (Timber, Acrylic, Leather, Glass) and bespoke craft journey, you are welcome to visit our Bespoke Objects page (/engraving).";
      } else if (lower.includes("currency") || lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
        responseText = "Prices are automatically displayed in your local currency. Bespoke physical commissions start from ₹1,299, and digital design suites begin at ₹499. Do you have a specific commission in mind?";
      } else if (lower.includes("who are you") || lower.includes("name") || lower.includes("bot")) {
        responseText = "I am the Olive Seeds Design Studio concierge. I assist in introducing our collections and structuring bespoke commission briefs.";
      } else if (lower.includes("refund") || lower.includes("return") || lower.includes("cancel")) {
        responseText = "For bespoke physical commissions, returns are not accepted once crafting commences, though comprehensive digital proofs are shared for approval prior to production. Digital design suites are delivered immediately upon order.";
      } else {
        // Highly contextual fallback helper to avoid repetition
        const sanitized = userText.length > 50 ? userText.slice(0, 47) + "..." : userText;
        responseText = `I would be pleased to assist you with "${sanitized}". Could you clarify whether your interest lies in a bespoke physical commission (timber or acrylic pieces) or one of our digital design systems? I can package this directly as an enquiry draft for our team.`;
      }

      setTimeout(() => {
        setChatHistory(prev => [...prev, { sender: "bot", text: responseText }]);
        setLoading(false);
      }, 750);

    } catch (err) {
      setChatHistory(prev => [...prev, { sender: "bot", text: "Our concierge system is momentarily unavailable. Would you like to connect directly via WhatsApp to speak with our studio team?" }]);
      setLoading(false);
    }
  };

  const handleRouteToWhatsApp = () => {
    // Collect last user prompts or default template
    const lastUserMsg = chatHistory.filter(c => c.sender === "user").pop()?.text || "Hello Olive Seeds, I would like to enquire about a bespoke commission.";
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
          title="Olive Seeds Studio Concierge"
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
            Studio Concierge
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
                <div className="text-xs font-black tracking-wide">Olive Seeds Studio Concierge</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Online • Studio Concierge
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
              Studio Concierge
            </button>
            <button 
              onClick={() => setMode("whatsapp")}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition ${mode === "whatsapp" ? "bg-emerald-600 text-white shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
            >
              WhatsApp Atelier
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
              <span className="text-[10px] text-emerald-800 font-bold">Connect directly with our studio:</span>
              <button 
                onClick={handleRouteToWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md transition"
              >
                Direct WhatsApp Enquiry
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
              placeholder={mode === "ai" ? "Enquire about materials, dimensions, timelines..." : "Type your enquiry for WhatsApp..."}
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
