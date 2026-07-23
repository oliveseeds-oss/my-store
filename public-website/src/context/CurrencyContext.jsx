import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
    const [currencies, setCurrencies] = useState([]);
    const [selected, setSelected] = useState(
        () => JSON.parse(localStorage.getItem("currency") || "null") ||
        {
            country_name: "India", country_code: "IN", currency_code: "INR",
            currency_symbol: "₹", flag_emoji: "🇮🇳", rate_to_inr: 1
        }
    );

    useEffect(() => {
        API.get("/currency?active=1").then(r => {
            const list = r.data;
            setCurrencies(list);

            // 1. Check persistent manual selection override first (one-time choice)
            const manualOverride = localStorage.getItem("currency_override");
            if (manualOverride) {
                const c = JSON.parse(manualOverride);
                setSelected(c);
                localStorage.setItem("currency", JSON.stringify(c));
                return;
            }

            // 2. Default must be based on region of member profile if logged in
            const stored = JSON.parse(localStorage.getItem("member") || "null");
            const memberProfile = stored ? (stored.member || stored) : null;
            if (memberProfile) {
                API.get("/members/profile")
                    .then((profileRes) => {
                        const country = profileRes.data.country;
                        if (country && list.length) {
                            const match = list.find(c =>
                                c.country_name.toLowerCase().includes(country.toLowerCase()) ||
                                country.toLowerCase().includes(c.country_name.toLowerCase()) ||
                                c.country_code.toLowerCase() === country.toLowerCase()
                            );
                            if (match) {
                                setSelected(match);
                                localStorage.setItem("currency", JSON.stringify(match));
                            }
                        }
                    })
                    .catch(() => {
                        // Fallback to IP geolocation if profile check fails
                        detectIPCurrency(list);
                    });
            } else {
                // If not logged in, auto detect by IP geolocation
                detectIPCurrency(list);
            }
        });

        // Helper to detect currency by visitor's IP geolocation
        function detectIPCurrency(list) {
            fetch("https://ipapi.co/json/")
                .then(res => res.json())
                .then(geo => {
                    const countryCode = geo.country_code; // e.g. "US", "GB", "IN"
                    if (countryCode && list.length) {
                        const match = list.find(c => c.country_code.toUpperCase() === countryCode.toUpperCase());
                        if (match) {
                            setSelected(match);
                            localStorage.setItem("currency", JSON.stringify(match));
                        } else {
                            // Target countries list check: USA, UK, Canada, Australia, Malaysia, Singapore, UAE, India, South Korea, Japan, Germany, New Zealand, Saudi Arabia, Ireland, Belgium, Sweden, Switzerland
                            // If they are from outside this list, default/commonly show Dollar (US)
                            const usdMatch = list.find(c => c.currency_code === "USD");
                            if (usdMatch) {
                                setSelected(usdMatch);
                                localStorage.setItem("currency", JSON.stringify(usdMatch));
                            }
                        }
                    }
                })
                .catch(err => {
                    console.warn("Geolocation currency detection failed, using defaults:", err);
                });
        }

        // Visitor ping
        API.post("/notifications/visitor", { page: window.location.pathname }).catch(() => { });
    }, []);

    const choose = (c) => {
        setSelected(c);
        localStorage.setItem("currency", JSON.stringify(c));
        localStorage.setItem("currency_override", JSON.stringify(c)); // Lock in persistent sticky choice
    };

    // Convert INR price to selected currency
    const convert = (inrPrice) => {
        const amount = inrPrice * selected.rate_to_inr;
        return `${selected.currency_symbol}${amount.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currencies, selected, choose, convert }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => useContext(CurrencyContext);