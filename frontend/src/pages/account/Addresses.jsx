
// import { useState } from "react";
// import MapModal from "../../components/address/MapModal";

// export default function Addresses() {
//   const [showMap, setShowMap] = useState(false);
//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [pincode, setPincode] = useState("");

//   return (
//     <div className="address-wrapper">
//       <h2>Delivery Address</h2>

//       <button
//         className="map-btn"
//         onClick={() => setShowMap(true)}
//       >
//         📍 Select from Map
//       </button>

//       <input value={address} placeholder="Address" />
//       <input value={city} placeholder="City" />
//       <input value={pincode} placeholder="Pincode" />

//       <button className="save-btn">Save Address</button>

//       {showMap && (
//         <MapModal
//           onClose={() => setShowMap(false)}
//           onSelect={(data) => {
//             setAddress(data.display_name || "");
//             setCity(
//               data.address.city ||
//               data.address.town ||
//               data.address.village ||
//               ""
//             );
//             setPincode(data.address.postcode || "");
//             setShowMap(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import API from "../../services/api";
import AddressForm from "../../components/address/AddressForm";
import MapModal from "../../components/address/MapModal";

export default function Addresses() {
  const [showMap, setShowMap] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [addresses, setAddresses] = useState([]);

const [form, setForm] = useState({
  label: "Home",
  name: "",
  phone: "",
  house: "",
  floor: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  lat: null,
  lng: null,
});

  /* 🔁 LOAD ADDRESSES */
  const loadAddresses = async () => {
    const res = await API.get("/address");
    setAddresses(res.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAddresses();
    
  }, []);

  /* ✏️ EDIT */
  const startEdit = (addr) => {
    setEditingId(addr._id);
    setForm(addr);
  };

  /* 💾 SAVE (ADD + UPDATE) */
  const saveAddress = async () => {
  if (!form.name || !form.phone|| !form.state || !form.house) {
  alert("Please fill all required fields");
  return;
}

    try {
      if (editingId) {
        await API.put(`/address/${editingId}`, form); // UPDATE
      } else {
        await API.post("/address", form); // ADD
      }

      setEditingId(null);
      setForm({
     label: "Home",
  name: "",
  phone: "",
  house: "",
  floor: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  lat: null,
  lng: null,
      });

      loadAddresses();
    } catch (err) {
      console.error("Save address error:", err.response?.data || err.message);
      alert("Save failed ❌");
    }
  };

  /* 🗑 DELETE */
  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await API.delete(`/address/${id}`);
    loadAddresses();
  };

  return (
    <div className="address-page">
      <button className="use-map-btn" onClick={() => setShowMap(true)}>
        📍 Use map to select location
      </button>

      <AddressForm geoData={geoData} form={form} setForm={setForm} />

      <button className="save-btn" onClick={saveAddress}>
        {editingId ? "Update Address" : "Save Address"}
      </button>

      <div className="saved-address-list">
        {addresses.map((addr) => (
          <div key={addr._id} className="saved-address-card">
            <strong>{addr.label}</strong>
            <p>{addr.house}, {addr.landmark}, {addr.area}</p>
            <small>{addr.city} - {addr.pincode}</small>
            <p>{addr.state}</p>
            <p>{addr.name}</p>
            <p>📞 {addr.phone}</p>
        
            <div className="addr-actions">
              <button onClick={() => startEdit(addr)}>✏️ Edit</button>
              <button onClick={() => deleteAddress(addr._id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelect={(data) => {
            setGeoData(data);
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
}
