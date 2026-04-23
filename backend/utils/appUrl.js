import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const DEFAULT_LOCAL_CLIENT_URL = "http://localhost:5173";
const DEFAULT_PUBLIC_CLIENT_URL = "https://jewellery-shop-pariva.vercel.app";

const normalizeUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

export const getPrimaryClientUrl = () => {
  const configured = process.env.CLIENT_URL || process.env.APP_URL || "";
  const [primary] = configured.split(",");
  const normalizedPrimary = normalizeUrl(primary);

  if (normalizedPrimary) {
    return normalizedPrimary;
  }

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_PUBLIC_CLIENT_URL;
  }

  return DEFAULT_LOCAL_CLIENT_URL;
};

export const buildClientUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPrimaryClientUrl()}${normalizedPath}`;
};
