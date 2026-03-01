
import { useEffect } from "react";  
// export default function AddressForm({ geoData, form, setForm }) {

//   useEffect(() => {
//     if (!geoData) return;

//     setForm((f) => ({
//       ...f,
//       area: geoData.display_name,
//       city: geoData.city || "",
//       pincode: geoData.pincode || "",
//       lat: geoData.lat,
//       lng: geoData.lng,
//     }));
//   }, [geoData, setForm]);

//   return (
//     <>
//       {/* LABEL */}
//       <div className="label-row">
//         {["Home", "Work", "Hotel", "Other"].map((l) => (
//           <button
//             key={l}
//             className={form.label === l ? "active" : ""}
//             onClick={() => setForm({ ...form, label: l })}
//           >
//             {l}
//           </button>
//         ))}
//       </div>

//       <input
//         placeholder="Flat / House no / Building name *"
//         value={form.house}
//         onChange={(e) => setForm({ ...form, house: e.target.value })}
//       />

//       <input
//         placeholder="Floor (optional)"
//         value={form.floor}
//         onChange={(e) => setForm({ ...form, floor: e.target.value })}
//       />

//       <input value={form.area} disabled />

//       <input
//         placeholder="Nearby landmark (optional)"
//         value={form.landmark}
//         onChange={(e) => setForm({ ...form, landmark: e.target.value })}
//       />

//       <input value={form.city} disabled />
//       <input value={form.pincode} disabled />
//     </>
//   );
// }
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
}, [geoData,setForm]);

  return (
    <>
      {/* LABEL */}
      <div className="label-row">
        {["Home", "Work", "Hotel", "Other"].map((l) => (
          <button
            key={l}
            className={form.label === l ? "active" : ""}
            onClick={() => setForm({ ...form, label: l })}
          >
            {l}
          </button>
        ))}
      </div>

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

      <input value={form.area} disabled />

      <input
        placeholder="Nearby landmark (optional)"
        value={form.landmark}
        onChange={(e) => setForm({ ...form, landmark: e.target.value })}
      />

      <input value={form.city} disabled />
      <input value={form.pincode} disabled />
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
  placeholder="Phone Number *"
  value={form.phone || ""}
  onChange={(e) => setForm({ ...form, phone: e.target.value })}
/>

    </>
  );
}
