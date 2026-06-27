import { useState, useRef, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";

export default function CurrencySelector() {
    const { currencies, selected, choose } = useCurrency();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = currencies.filter(c =>
        c.country_name.toLowerCase().includes(search.toLowerCase()) ||
        c.currency_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-stone-200
                   bg-white hover:bg-stone-50 rounded-lg transition text-stone-600">
                <span>{selected.flag_emoji}</span>
                <span className="font-medium">{selected.currency_code}</span>
                <span className="text-stone-400 text-xs">▼</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-stone-200
                        rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-2 border-b border-stone-100">
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search country..."
                            autoFocus
                            className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        {filtered.map(c => (
                            <button key={c.country_code}
                                onClick={() => { choose(c); setOpen(false); setSearch(""); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs text-left
                            hover:bg-stone-50 transition
                  ${selected.country_code === c.country_code ? "bg-indigo-50 font-semibold" : ""}`}>
                                <span className="text-lg">{c.flag_emoji}</span>
                                <span className="flex-1 text-stone-700">{c.country_name}</span>
                                <span className="text-stone-400 font-medium">
                                    {c.currency_symbol} {c.currency_code}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}