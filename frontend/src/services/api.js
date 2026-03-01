import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let setLoader = null;

export const registerLoader = (fn) => {
  setLoader = fn;
};

API.interceptors.request.use((config) => {
   const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ FIXED: Ensure proper content-type
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
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