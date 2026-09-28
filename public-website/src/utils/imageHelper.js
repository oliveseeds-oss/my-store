/**
 * Utility to reliably extract, format, and resolve product images across all devices (Mobile, Tablet, Desktop).
 */

const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (trimmed.includes(",") || trimmed.includes(" ")) {
    trimmed = trimmed.split(/[\s,]+/)[0].trim();
  }
  if (!trimmed || trimmed === "[" || trimmed === "]" || trimmed.length < 5) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    if (API_BASE) return `${API_BASE}${trimmed}`;
    return trimmed;
  }
  return trimmed;
}

export function parseImagesList(rawImages) {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) {
    return rawImages.map(resolveImageUrl).filter(Boolean);
  }
  if (typeof rawImages === "string") {
    const trimmed = rawImages.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(resolveImageUrl).filter(Boolean);
        }
      } catch (e) {
        // Fall back to splitting
      }
    }
    return trimmed.split(/[\n,]+/).map(resolveImageUrl).filter(Boolean);
  }
  return [];
}

export function getProductMainImage(product) {
  if (!product) return "";
  
  if (product.image_url) {
    const resolved = resolveImageUrl(product.image_url);
    if (resolved) return resolved;
  }
  if (product.thumbnail_url) {
    const resolved = resolveImageUrl(product.thumbnail_url);
    if (resolved) return resolved;
  }
  
  const fromImages = parseImagesList(product.images);
  if (fromImages.length > 0) {
    return fromImages[0];
  }
  
  return "";
}

export function getAllProductImages(product) {
  if (!product) return [];
  const list = [];
  
  if (product.image_url) {
    const fromImageUrl = parseImagesList(product.image_url);
    list.push(...fromImageUrl);
  }
  if (product.thumbnail_url) {
    const fromThumbnail = parseImagesList(product.thumbnail_url);
    list.push(...fromThumbnail);
  }
  
  const fromImages = parseImagesList(product.images);
  list.push(...fromImages);
  
  return [...new Set(list)];
}
