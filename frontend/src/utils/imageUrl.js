import { API_BASE_URL } from "../services/api";

const PRODUCT_IMAGE_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffaf2" />
        <stop offset="55%" stop-color="#f2e6d2" />
        <stop offset="100%" stop-color="#dcebe7" />
      </linearGradient>
    </defs>
    <rect width="640" height="800" rx="36" fill="url(#bg)" />
    <rect x="32" y="32" width="576" height="736" rx="30" fill="none" stroke="#c8a46a" stroke-dasharray="8 10" opacity="0.8" />
    <circle cx="320" cy="298" r="86" fill="#f7f0e4" stroke="#c8a46a" stroke-width="10" />
    <path d="M236 434l84-78 70 60 58-46 72 64v116H120V434z" fill="#eadfcd" stroke="#c8a46a" stroke-width="10" stroke-linejoin="round" />
    <text x="320" y="628" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#7a6240">PARIVA</text>
    <text x="320" y="668" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#8d7a61">Product image unavailable</text>
  </svg>
`)}`;

export function getProductImageSrc(image) {
  if (!image) return PRODUCT_IMAGE_FALLBACK;

  const raw = String(image).trim();
  if (!raw) return PRODUCT_IMAGE_FALLBACK;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  if (raw.startsWith("/uploads/")) {
    return `${API_BASE_URL}${raw}`;
  }

  if (raw.startsWith("uploads/")) {
    return `${API_BASE_URL}/${raw}`;
  }

  const uploadsIndex = raw.indexOf("/uploads/");
  if (uploadsIndex > 0) {
    return `${API_BASE_URL}${raw.slice(uploadsIndex)}`;
  }

  return `${API_BASE_URL}/uploads/${raw}`;
}

export function handleProductImageError(event) {
  if (!event?.currentTarget) return;

  event.currentTarget.onerror = null;
  event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
}

export { PRODUCT_IMAGE_FALLBACK };
