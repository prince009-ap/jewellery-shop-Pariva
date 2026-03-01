import axios from "axios";

const adminAPI = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔐 ADMIN TOKEN ONLY
adminAPI.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

export default adminAPI;
