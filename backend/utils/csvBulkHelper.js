const { parse } = require("csv-parse/sync");

/**
 * Parse CSV file buffer into array of row objects
 * Automatically ignores instruction comment lines starting with '#'
 */
const parseCsvFile = (fileBuffer) => {
  if (!fileBuffer) return [];
  const content = Buffer.isBuffer(fileBuffer) ? fileBuffer.toString("utf8") : String(fileBuffer);
  
  // Remove comment rows starting with # and BOM character if present
  const cleanContent = content.replace(/^\uFEFF/, "");
  const lines = cleanContent
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  if (!lines.trim()) return [];

  const records = parse(lines, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false, // keep as strings to preserve phone/sku formats, manually parse numbers
    relax_column_count: true,
    relax_quotes: true,
    escape: "\\",
  });

  return records;
};

/**
 * Validate required fields on a single row object
 */
const validateRequired = (row, fields) => {
  const errors = [];
  fields.forEach((field) => {
    if (row[field] === undefined || row[field] === null || String(row[field]).trim() === "") {
      errors.push(`${field} is required`);
    }
  });
  return errors;
};

/**
 * Generate a clean URL-friendly slug from title
 */
const generateSlug = (text) => {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Helper to escape and quote a CSV cell value
 */
const escapeCsvCell = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Build CSV string from column headers and an array of objects
 */
const buildCsv = (headers, rows) => {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvCell(row[h] !== undefined ? row[h] : "")).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
};

module.exports = {
  parseCsvFile,
  validateRequired,
  generateSlug,
  escapeCsvCell,
  buildCsv,
};
