/**
 * Utility to reliably extract, format, and resolve product images across all devices (Mobile, Tablet, Desktop).
 */

const getApiBase = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname.endsWith("oliveseedsdesignstudio.com")) {
      return "https://apiosspanel.oliveseedsdesignstudio.com";
    }
  }
  return "http://200.141.2.131:5000";
};
const API_BASE = getApiBase();

export function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
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
    return trimmed.split(/[\n,]+/).map(u => u.trim()).filter(Boolean).map(resolveImageUrl).filter(Boolean);
  }
  return [];
}

export function getProductMainImage(product) {
  if (!product) return "";
  
  if (product.image_url) {
    const list = parseImagesList(product.image_url);
    if (list.length > 0) return list[0];
  }
  if (product.thumbnail_url) {
    const list = parseImagesList(product.thumbnail_url);
    if (list.length > 0) return list[0];
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
