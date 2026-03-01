import API from "./api";

export const getProducts = () => API.get("/products");
export const getAdminProducts = () => API.get("/admin/products");

export const fetchProducts = async () => {
  const res = await API.get("/products");
  return res.data;
};

