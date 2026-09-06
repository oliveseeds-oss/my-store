import React, { useMemo } from "react";
import { Country, State } from "country-state-city";
import { getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * Returns flag emoji for ISO country code
 */
export function getFlagEmoji(countryCode) {
  if (!countryCode) return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Smart Address Form Component
 * Used in Profile (editable) and Checkout (editable when guest/no saved address)
 */
export default function SmartAddressForm({
  form,
  onChange,
  enabledCountryCodes = [], // array of upper ISO codes e.g. ["IN", "US", "GB"]
  isPhysical = true,
  readOnly = false,
}) {
  // Get all countries from country-state-city
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Find currently selected Country object by Name or ISO Code
  const currentCountryObj = useMemo(() => {
    if (!form.country) return allCountries.find(c => c.isoCode === "IN") || allCountries[0];
    return (
      allCountries.find(c => c.name.toLowerCase() === form.country.toLowerCase()) ||
      allCountries.find(c => c.isoCode.toLowerCase() === form.country.toLowerCase()) ||
      allCountries[0]
    );
  }, [form.country, allCountries]);

  // States for current country
  const statesList = useMemo(() => {
    if (!currentCountryObj) return [];
    return State.getStatesOfCountry(currentCountryObj.isoCode);
  }, [currentCountryObj]);

  // Labels dynamically named per country
  const getFieldLabels = (isoCode) => {
    switch (isoCode) {
      case "US":
        return { stateLabel: "State", zipLabel: "ZIP Code", showZip: true };
      case "IN":
        return { stateLabel: "State", zipLabel: "PIN Code", showZip: true };
      case "CA":
        return { stateLabel: "Province", zipLabel: "Postal Code", showZip: true };
      case "AU":
      case "GB":
        return { stateLabel: "Region / State", zipLabel: "Postal Code", showZip: true };
      case "AE":
      case "QA":
      case "KW":
      case "BH":
      case "OM":
      case "SA":
        return { stateLabel: "Emirate / Region", zipLabel: "Postal Code", showZip: false }; // GCC often omits postcodes
      default:
        return { stateLabel: "State / Province / Region", zipLabel: "Postal Code", showZip: true };
    }
  };

  const { stateLabel, zipLabel, showZip } = getFieldLabels(currentCountryObj?.isoCode);

  // Handle Country selection change
  const handleCountryChange = (e) => {
    const selectedIso = e.target.value;
    const countryObj = allCountries.find(c => c.isoCode === selectedIso);
    if (!countryObj) return;

    const newStates = State.getStatesOfCountry(countryObj.isoCode);
    const defaultState = newStates.length > 0 ? newStates[0].name : "";

    onChange({
      ...form,
      country: countryObj.name,
      state: defaultState,
      // Update dial code in phone if formatted or prefix set
    });
  };

  // Phone number validation helper
  const phoneValidation = useMemo(() => {
    if (!form.phone) return { isValid: true };
    try {
      const phoneNumber = parsePhoneNumberFromString(form.phone, currentCountryObj?.isoCode);
      if (phoneNumber) {
        return {
          isValid: phoneNumber.isValid(),
          formatted: phoneNumber.formatInternational()
        };
      }
    } catch {}
    return { isValid: true };
  }, [form.phone, currentCountryObj]);

  return (
    <div className="space-y-4 text-left">
      {/* 1. Full Name */}
      <div>
        <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
          Full Name *
        </label>
        <input
          type="text"
          required
          disabled={readOnly}
          value={form.name || form.full_name || ""}
          onChange={(e) => onChange({ ...form, name: e.target.value, full_name: e.target.value })}
          className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
          placeholder="John Doe"
        />
      </div>

      {/* 2. Phone — dial code prefix dropdown (auto-set from country) + number input, validated with libphonenumber-js */}
      <div>
        <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
          Phone Number *
        </label>
        <div className="flex gap-2">
          <select
            disabled={readOnly}
            value={currentCountryObj?.isoCode}
            onChange={handleCountryChange}
            className="bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-3 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] font-mono shrink-0 disabled:bg-stone-100 disabled:cursor-not-allowed"
          >
            {allCountries.map((c) => {
              let code = "+1";
              try {
                code = "+" + getCountryCallingCode(c.isoCode);
              } catch {}
              return (
                <option key={`dial-${c.isoCode}`} value={c.isoCode}>
                  {c.flag || getFlagEmoji(c.isoCode)} {code}
                </option>
              );
            })}
          </select>
          <input
            type="tel"
            required
            disabled={readOnly}
            value={form.phone || ""}
            onChange={(e) => onChange({ ...form, phone: e.target.value })}
            className={`w-full bg-[#FAF9F6]/20 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed ${
              !phoneValidation.isValid ? "border-rose-400 focus:ring-rose-300" : "border-[#0D1512]/20 focus:ring-[#0D1512]/40"
            }`}
            placeholder="98765 43210"
          />
        </div>
        {!phoneValidation.isValid && (
          <p className="text-[10px] text-rose-500 mt-1 font-semibold">
            Please enter a valid phone number for {currentCountryObj?.name}
          </p>
        )}
      </div>

      {!isPhysical && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-3.5 text-xs flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <p className="font-bold text-emerald-900">Digital Product Order</p>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              No physical delivery is needed. All download files, source assets, and license keys will be instantly delivered to your registered email upon payment.
            </p>
          </div>
        </div>
      )}

      {/* 3. Physical Address Fields (Hidden for digital products) */}
      {isPhysical && (
        <>
          <div>
            <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              disabled={readOnly}
              value={form.delivery_street || form.street_address || ""}
              onChange={(e) => onChange({ ...form, delivery_street: e.target.value, street_address: e.target.value })}
              className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="Flat / House No., Street Name, Area"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={form.delivery_apt || form.apt_suite || ""}
              onChange={(e) => onChange({ ...form, delivery_apt: e.target.value, apt_suite: e.target.value })}
              className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
              placeholder="Apt, Suite, Unit, Building Floor"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
                City / Town / Suburb *
              </label>
              <input
                type="text"
                required
                disabled={readOnly}
                value={form.delivery_city || form.city || ""}
                onChange={(e) => onChange({ ...form, delivery_city: e.target.value, city: e.target.value })}
                className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
                placeholder="City Name"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
                {stateLabel} *
              </label>
              {statesList.length > 0 ? (
                <select
                  disabled={readOnly}
                  value={form.delivery_state || form.state || ""}
                  onChange={(e) => onChange({ ...form, delivery_state: e.target.value, state: e.target.value })}
                  className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  {statesList.map((s) => (
                    <option key={s.isoCode || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  disabled={readOnly}
                  value={form.delivery_state || form.state || ""}
                  onChange={(e) => onChange({ ...form, delivery_state: e.target.value, state: e.target.value })}
                  className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="State / Region Name"
                />
              )}
            </div>

            {showZip && (
              <div>
                <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
                  {zipLabel} *
                </label>
                <input
                  type="text"
                  required={showZip}
                  disabled={readOnly}
                  value={form.delivery_pincode || form.pincode || ""}
                  onChange={(e) => onChange({ ...form, delivery_pincode: e.target.value, pincode: e.target.value })}
                  className="w-full bg-[#FAF9F6]/20 border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
                  placeholder="110001"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Country Dropdown */}
      <div>
        <label className="text-[10px] uppercase font-bold text-[#0D1512]/60 mb-1.5 block tracking-widest">
          Country {isPhysical ? "*" : "(Billing / Region)"}
        </label>
        <select
          disabled={readOnly}
          value={currentCountryObj?.isoCode}
          onChange={handleCountryChange}
          className="w-full bg-white border border-[#0D1512]/20 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D1512]/40 text-[#0D1512] disabled:bg-stone-100 disabled:cursor-not-allowed"
        >
          {allCountries.map((c) => {
            const upperIso = c.isoCode.toUpperCase();
            const isEnabled = !isPhysical || enabledCountryCodes.includes(upperIso);

            return (
              <option
                key={c.isoCode}
                value={c.isoCode}
                disabled={!isEnabled}
                className={!isEnabled ? "text-gray-400 bg-gray-100" : ""}
              >
                {c.flag || getFlagEmoji(c.isoCode)} {c.name} {!isEnabled ? " (Shipping Disabled)" : ""}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
