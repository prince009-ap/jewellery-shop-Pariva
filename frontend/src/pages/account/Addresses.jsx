import { useEffect, useState } from "react";
import API from "../../services/api";
import AddressForm from "../../components/address/AddressForm";
import MapModal from "../../components/address/MapModal";

export default function Addresses() {
  const [showMap, setShowMap] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [formMessage, setFormMessage] = useState("");
  const [formMessageType, setFormMessageType] = useState("info");
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

  const resetForm = () => {
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
    setGeoData(null);
  };

  const loadAddresses = async () => {
    const res = await API.get("/address");
    setAddresses(res.data);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setForm(addr);
    setFormMessage("");
  };

  const saveAddress = async () => {
    if (!form.name || !form.phone || !form.state || !form.house) {
      setFormMessage("Please fill all required fields.");
      setFormMessageType("error");
      return;
    }

    try {
      if (editingId) {
        await API.put(`/address/${editingId}`, form);
      } else {
        await API.post("/address", form);
      }

      setEditingId(null);
      resetForm();
      setFormMessage("Address saved successfully.");
      setFormMessageType("success");
      loadAddresses();
    } catch (err) {
      console.error("Save address error:", err.response?.data || err.message);
      setFormMessage("Save failed. Please try again.");
      setFormMessageType("error");
    }
  };

  const clearForm = () => {
    setEditingId(null);
    resetForm();
    setFormMessage("");
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    await API.delete(`/address/${id}`);
    loadAddresses();
  };

  return (
    <div className="address-page">
      <div className="address-form-shell">
        <button className="use-map-btn" onClick={() => setShowMap(true)}>
          Use map to select location
        </button>

        <div className="address-form-panel">
          <AddressForm geoData={geoData} form={form} setForm={setForm} />
        </div>

        {formMessage ? (
          <div className={`address-inline-message ${formMessageType}`}>
            {formMessage}
          </div>
        ) : null}

        <div className="address-form-actions">
          <button className="save-btn address-save-btn" onClick={saveAddress}>
            {editingId ? "Update Address" : "Save Address"}
          </button>
          <button type="button" className="use-map-btn address-clear-btn" onClick={clearForm}>
            Clear
          </button>
        </div>
      </div>

      <div className="saved-address-list">
        {addresses.map((addr) => (
          <div key={addr._id} className="saved-address-card">
            <strong>{addr.label}</strong>
            <p>{addr.house}, {addr.landmark}, {addr.area}</p>
            <small>{addr.city} - {addr.pincode}</small>
            <p>{addr.state}</p>
            <p>{addr.name}</p>
            <p>{addr.phone}</p>

            <div className="addr-actions">
              <button type="button" onClick={() => startEdit(addr)}>Edit</button>
              <button type="button" onClick={() => deleteAddress(addr._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelect={(data) => {
            setGeoData(data);
            setFormMessage("");
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
}
