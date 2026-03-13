import axios from "axios";
import { getUserToken, migrateLegacyUserSession } from "../utils/authStorage";

migrateLegacyUserSession();

export const API_BASE_URL = "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
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
    return Promise.reject(err);
  }
);

export default API;
