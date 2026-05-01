import axios from "axios";
import { getUserToken, migrateLegacyUserSession } from "../utils/authStorage";

migrateLegacyUserSession();

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:5000";

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  const { origin, hostname } = window.location;
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  return isLocalhost ? DEFAULT_LOCAL_API_BASE_URL : origin;
};

export const API_BASE_URL = resolveApiBaseUrl();

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 15000,
});

let setLoader = null;

export const registerLoader = (fn) => {
  setLoader = fn;
};

API.interceptors.request.use((config) => {
  const token = getUserToken() || sessionStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  if (!config.skipLoader && setLoader) {
    setLoader(true);
  }

  return config;
});

API.interceptors.response.use(
  (res) => {
    if (!res.config.skipLoader && setLoader) {
      setLoader(false);
    }
    return res;
  },
  (err) => {
    if (!err.config?.skipLoader && setLoader) {
      setLoader(false);
    }

    if (!err.response) {
      err.message =
        err.code === "ECONNABORTED"
          ? "Request timed out. Please check whether the backend is reachable."
          : "Unable to reach the server. Check the deployed API URL or CORS settings.";
    }

    return Promise.reject(err);
  }
);

export default API;
