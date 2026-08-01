const CURRENCY_DECIMALS = {
  // Zero-decimal currencies
  JPY: 0,
  CLP: 0,
  COP: 0,
  KRW: 0,
  VND: 0,

  // Three-decimal currencies
  KWD: 3,
  BHD: 3,
  OMR: 3,
  JOD: 3,
};

/**
 * Convert standard currency amount to Razorpay minor units (subunits)
 */
function getSubunits(amount, currencyCode) {
  const code = String(currencyCode).toUpperCase().trim();
  const decimals = CURRENCY_DECIMALS[code] !== undefined ? CURRENCY_DECIMALS[code] : 2;
  const factor = Math.pow(10, decimals);
  return Math.round(parseFloat(amount) * factor);
}

/**
 * Convert Razorpay minor units back to standard decimal amount
 */
function getAmountFromSubunits(subunits, currencyCode) {
  const code = String(currencyCode).toUpperCase().trim();
  const decimals = CURRENCY_DECIMALS[code] !== undefined ? CURRENCY_DECIMALS[code] : 2;
  const factor = Math.pow(10, decimals);
  return parseFloat(subunits) / factor;
}

module.exports = {
  getSubunits,
  getAmountFromSubunits
};
