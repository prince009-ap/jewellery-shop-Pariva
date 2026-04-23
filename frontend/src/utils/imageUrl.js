import { API_BASE_URL } from "../services/api";

export function getProductImageSrc(image) {
  if (!image) return "/images/placeholder.jpg";

  const raw = String(image).trim();
  if (!raw) return "/images/placeholder.jpg";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  if (raw.startsWith("/uploads/")) {
    return `${API_BASE_URL}${raw}`;
  }

  if (raw.startsWith("uploads/")) {
    return `${API_BASE_URL}/${raw}`;
  }

  return `${API_BASE_URL}/uploads/${raw}`;
}
