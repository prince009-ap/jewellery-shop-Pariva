import { API_BASE_URL } from "./api";
import axios from "axios";

const adminAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// 🔐 ADMIN TOKEN ONLY
adminAPI.interceptors.request.use((config) => {
  const adminToken = sessionStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export default adminAPI;
