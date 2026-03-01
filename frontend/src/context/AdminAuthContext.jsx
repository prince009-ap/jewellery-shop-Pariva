/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import adminAPI from "../services/adminApi";

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await adminAPI.get("/admin/me", {
          skipLoader: true,
        });

        setAdmin(res.data.admin || res.data);
      } catch (err) {
        console.error("Failed to load admin:", err);
        localStorage.removeItem("adminToken");
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loading }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
