export function getAdminCurrency() {
  const stored = localStorage.getItem("admin_currency");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  return {
    country_name: "India",
    country_code: "IN",
    currency_code: "INR",
    currency_symbol: "₹",
    rate_to_inr: 1.0
  };
}

export function formatAdminPrice(priceInInr) {
  const curr = getAdminCurrency();
  const rate = Number(curr.rate_to_inr) || 1.0;
  const amount = Number(priceInInr || 0) / rate;
  return `${curr.currency_symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
