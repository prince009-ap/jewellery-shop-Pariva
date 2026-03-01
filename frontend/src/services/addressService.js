import API from "./api";

export const fetchAddresses = () => API.get("/addresses");
export const addAddress = (data) => API.post("/addresses", data);
export const deleteAddress = (id) => API.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) =>
  API.put(`/addresses/default/${id}`);

// src/services/addressService.js
export const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );
  return res.json();
};
