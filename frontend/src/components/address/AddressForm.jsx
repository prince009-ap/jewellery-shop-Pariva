import { useEffect } from "react";

export default function AddressForm({ geoData, form, setForm }) {
  useEffect(() => {
    if (!geoData) return;

    setForm((f) => ({
      ...f,
      area: geoData.display_name || "",
      city:
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        "",
      state:
        geoData.address?.state ||
        geoData.address?.state_district ||
        geoData.address?.region ||
        "",
      pincode: geoData.address?.postcode || "",
      lat: geoData.lat,
      lng: geoData.lng,
    }));
  }, [geoData, setForm]);

  return (
    <>
      <div className="label-row">
        {["Home", "Work", "Hotel", "Other"].map((label) => (
          <button
            key={label}
            type="button"
            className={form.label === label ? "active" : ""}
            onClick={() => setForm({ ...form, label })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="address-form-grid">
        <input
          placeholder="Flat / House no / Building name *"
          value={form.house}
          onChange={(e) => setForm({ ...form, house: e.target.value })}
        />

        <input
          placeholder="Floor (optional)"
          value={form.floor}
          onChange={(e) => setForm({ ...form, floor: e.target.value })}
        />

        <input value={form.area} disabled placeholder="Area" />

        <input
          placeholder="Nearby landmark (optional)"
          value={form.landmark}
          onChange={(e) => setForm({ ...form, landmark: e.target.value })}
        />

        <input value={form.city} disabled placeholder="City" />
        <input value={form.pincode} disabled placeholder="Pincode" />

        <input
          placeholder="Full Name *"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="State *"
          value={form.state || ""}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />

        <input
          className="address-form-grid__full"
          placeholder="Phone Number *"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
    </>
  );
}
