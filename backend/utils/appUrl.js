const DEFAULT_CLIENT_URL = "http://localhost:5173";

export const getPrimaryClientUrl = () => {
  const configured = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
  const [primary] = configured.split(",");
  return (primary || DEFAULT_CLIENT_URL).trim().replace(/\/+$/, "");
};

export const buildClientUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPrimaryClientUrl()}${normalizedPath}`;
};
