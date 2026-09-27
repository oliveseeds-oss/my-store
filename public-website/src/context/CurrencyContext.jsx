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
            const list = Array.isArray(r.data) ? r.data : [];
            setCurrencies(list);

            // 1. Check persistent manual selection override first (one-time choice)
            const manualOverride = localStorage.getItem("currency_override");
            if (manualOverride) {
                const c = JSON.parse(manualOverride);
                const latestMatch = list.find(item => item.currency_code === c.currency_code);
                const updated = latestMatch || c;
                setSelected(updated);
                localStorage.setItem("currency", JSON.stringify(updated));
                localStorage.setItem("currency_override", JSON.stringify(updated));
                return;
            }

            // 2. Default must be based on region of member profile if logged in
            const stored = JSON.parse(localStorage.getItem("member") || "null");
            const memberProfile = stored ? (stored.member || stored) : null;
            const token = stored?.token || stored?.member?.token;
            if (memberProfile && token) {
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

        // Helper to ping visitor notification with rich location data
        function sendVisitorPing(geoInfo = null) {
            let finalGeo = geoInfo;
            if (!finalGeo) {
                try {
                    finalGeo = JSON.parse(sessionStorage.getItem("visitor_geo") || "null");
                } catch (e) {}
            }
            API.post("/notifications/visitor", {
                page: window.location.pathname,
                city: finalGeo?.city || null,
                region: finalGeo?.region || null,
                country: finalGeo?.country_name || finalGeo?.country || null,
                country_code: finalGeo?.country_code || null
            }).catch(() => {});
        }

        // Helper to detect currency by visitor's IP geolocation
        function detectIPCurrency(list) {
            fetch("https://ipapi.co/json/")
                .then(res => {
                    if (!res.ok) throw new Error("Primary geo-lookup failed");
                    return res.json();
                })
                .then(geo => {
                    const geoData = {
                        city: geo.city,
                        region: geo.region,
                        country_name: geo.country_name,
                        country_code: geo.country_code
                    };
                    try { sessionStorage.setItem("visitor_geo", JSON.stringify(geoData)); } catch (e) {}
                    handleGeoResult(geo.country_code, list);
                    sendVisitorPing(geoData);
                })
                .catch(err => {
                    console.warn("Primary geolocation failed, trying fallback:", err.message);
                    fetch("https://ip-api.com/json")
                        .then(res => res.json())
                        .then(geo => {
                            const geoData = {
                                city: geo.city,
                                region: geo.regionName,
                                country_name: geo.country,
                                country_code: geo.countryCode
                            };
                            try { sessionStorage.setItem("visitor_geo", JSON.stringify(geoData)); } catch (e) {}
                            handleGeoResult(geo.countryCode, list);
                            sendVisitorPing(geoData);
                        })
                        .catch(fallbackErr => {
                            console.warn("Fallback geolocation failed:", fallbackErr.message);
                            sendVisitorPing();
                        });
                });
        }

        function handleGeoResult(countryCode, list) {
            if (countryCode && list.length) {
                const match = list.find(c => c.country_code.toUpperCase() === countryCode.toUpperCase());
                if (match) {
                    setSelected(match);
                    localStorage.setItem("currency", JSON.stringify(match));
                } else {
                    const usdMatch = list.find(c => c.currency_code === "USD");
                    if (usdMatch) {
                        setSelected(usdMatch);
                        localStorage.setItem("currency", JSON.stringify(usdMatch));
                    }
                }
            }
        }

        // Initial visitor ping
        sendVisitorPing();
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