// import { useState } from "react";
// import { addAddress } from "../../services/addressService";

// export default function AddAddressModal({ onClose }) {
//   const [form, setForm] = useState({
//     name: "", phone: "", addressLine: "",
//     city: "", state: "", pincode: "",
//     label: "Home", isDefault: true
//   });

//   const submit = async () => {
//     await addAddress(form);
//     onClose();
//   };

//   return (
//     <div className="modal">
//       <input placeholder="Address" onChange={e => setForm({...form, addressLine: e.target.value})} />
//       <input placeholder="City" onChange={e => setForm({...form, city: e.target.value})} />
//       <input placeholder="Pincode" onChange={e => setForm({...form, pincode: e.target.value})} />

//       <button onClick={submit}>Save</button>
//       <button onClick={onClose}>Cancel</button>
//     </div>
//   );
// }
import { useState } from "react";
import API from "../../services/api";

export default function AddAddress({ onClose }) {
  const [form, setForm] = useState({
    fullAddress: "",
    city: "",
    pincode: ""
  });

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      const data = await res.json();

      setForm({
        fullAddress: data.display_name,
        city: data.address.city || data.address.town,
        pincode: data.address.postcode
      });
    });
  };

  const saveAddress = async () => {
    await API.post("/address", form);
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal">
      <h3>Add Address</h3>

      <button onClick={getCurrentLocation}>
        📍 Use current location
      </button>

      <input
        placeholder="Full Address"
        value={form.fullAddress}
        onChange={e => setForm({...form, fullAddress: e.target.value})}
      />

      <input
        placeholder="City"
        value={form.city}
        onChange={e => setForm({...form, city: e.target.value})}
      />

      <input
        placeholder="Pincode"
        value={form.pincode}
        onChange={e => setForm({...form, pincode: e.target.value})}
      />

      <button onClick={saveAddress}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
