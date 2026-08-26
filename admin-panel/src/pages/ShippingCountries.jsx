import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import API from "../api";
import { Country } from "country-state-city";
import { MdSearch, MdCheckCircle, MdPublic } from "react-icons/md";

// Helper for flag emojis if not supported directly by Country object
function getFlagEmoji(countryCode) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function ShippingCountries() {
  const [dbCountriesMap, setDbCountriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Get full list of ALL countries in the world using country-state-city
  const allCountries = Country.getAllCountries();

  const fetchCountries = async () => {
    try {
      const res = await API.get("/admin/shipping-countries");
      const map = {};
      res.data.forEach((c) => {
        map[c.country_code.toUpperCase()] = c.is_enabled;
      });
      setDbCountriesMap(map);
    } catch (err) {
      console.error("Failed to load admin shipping countries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleToggle = async (country) => {
    const code = country.isoCode.toUpperCase();
    const currentStatus = !!dbCountriesMap[code];
    const newStatus = !currentStatus;

    // Optimistic UI update
    setDbCountriesMap((prev) => ({
      ...prev,
      [code]: newStatus,
    }));

    try {
      await API.put(`/admin/shipping-countries/${code}`, {
        is_enabled: newStatus,
        country_name: country.name,
      });

      setToast(`${country.name} ${newStatus ? "enabled" : "disabled"}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(`Failed to update shipping for ${country.name}`, err);
      // Revert optimistic update on error
      setDbCountriesMap((prev) => ({
        ...prev,
        [code]: currentStatus,
      }));
      setToast(`Failed to update ${country.name}`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.isoCode.toLowerCase().includes(search.toLowerCase())
  );

  const enabledCount = Object.values(dbCountriesMap).filter(Boolean).length;

  return (
    <div className="flex bg-stone-50 min-h-screen text-stone-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title="Shipping Countries Manager" />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl">
          {/* Header section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Shipping Countries Manager</h2>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  {enabledCount} countries enabled for shipping
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enable or disable countries for physical product shipping. Digital products always ship worldwide.
              </p>
            </div>
            
            {/* Search bar */}
            <div className="relative min-w-[260px]">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search country by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
              <MdCheckCircle className="text-emerald-400 text-base" />
              {toast}
            </div>
          )}

          {/* Countries Table / Grid List */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading world countries database...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                <div className="bg-stone-50 px-6 py-3 grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-1">Flag</div>
                  <div className="col-span-6">Country Name</div>
                  <div className="col-span-2">ISO Code</div>
                  <div className="col-span-3 text-right">Physical Shipping</div>
                </div>

                {filteredCountries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">No countries match "{search}"</div>
                ) : (
                  filteredCountries.map((c) => {
                    const code = c.isoCode.toUpperCase();
                    const isEnabled = !!dbCountriesMap[code];
                    const flag = c.flag || getFlagEmoji(code);

                    return (
                      <div key={code} className="px-6 py-3.5 grid grid-cols-12 items-center hover:bg-stone-50/80 transition">
                        <div className="col-span-1 text-xl">{flag}</div>
                        <div className="col-span-6 text-xs font-bold text-gray-800">{c.name}</div>
                        <div className="col-span-2 font-mono text-xs text-gray-500">{code}</div>
                        <div className="col-span-3 flex justify-end items-center gap-3">
                          <span className={`text-[11px] font-semibold ${isEnabled ? "text-emerald-600" : "text-gray-400"}`}>
                            {isEnabled ? "Enabled" : "Disabled"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggle(c)}
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                              isEnabled ? "bg-emerald-500 justify-end" : "bg-gray-200 justify-start"
                            }`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
