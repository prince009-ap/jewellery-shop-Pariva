// import { useCart } from "../../context/useCart";
// import { useEffect, useState } from "react";
// import API from "../../services/api";
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";


// export default function Checkout() {
//   const { cart } = useCart();
//   const navigate = useNavigate();
// const location = useLocation();
// const customData = location.state?.customDesign;
// const source = location.state?.source;

//   const [addresses, setAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);

//   // 🔹 load saved addresses
//   useEffect(() => {
//     API.get("/address").then((res) => {
//       setAddresses(res.data);
//       const def = res.data.find((a) => a.isDefault);
//       if (def) setSelectedAddress(def._id);
//     });
//   }, []);

//   // if (cart.length === 0) {
//   //   return <h2 style={{ padding: 40 }}>Cart is empty</h2>;
//   // }

//   return (
//     <div className="checkout-page">
//       {/* LEFT */}
//       <div className="checkout-left">
//         <h2>Select Delivery Address</h2>

//         {addresses.map((addr) => (
//           <div
//             key={addr._id}
//             className={`address-card ${
//               selectedAddress === addr._id ? "active" : ""
//             }`}
//             onClick={() => setSelectedAddress(addr._id)}
//           >
//             <strong>{addr.label}</strong>
//             <p>
//               {addr.house}, {addr.area}
//             </p>
//             <small>
//               {addr.city} - {addr.pincode}
//             </small>
//           </div>
//         ))}

//         <button
//           className="add-new-btn"
//           onClick={() => navigate("/account/addresses")}
//         >
//           + Add New Address
//         </button>
//       </div>

//       {/* RIGHT */}
//       <div className="checkout-right">
//         <h2>Order Summary</h2>

//         {/* 🛒 CART FLOW */}
// {source !== "custom" &&
//   cart.map((i) => (
//     <div key={i.product._id} className="summary-row">
//       <span>
//         {i.product.name} × {i.qty}
//       </span>
//       <span>₹{i.product.price * i.qty}</span>
//     </div>
//   ))}

// {/* 💍 CUSTOM DESIGN FLOW */}
// {source === "custom" && customData && (
//   <div className="summary-row">
//     <span>{customData.name}</span>
//     <span>₹{customData.price}</span>
//   </div>
// )}


//         <hr />

//         <button
//           className="place-order-btn"
//           disabled={!selectedAddress}
//           onClick={() =>
//   navigate("/checkout/payment", {
//     state: {
//       addressId: selectedAddress,
//       source,
//       customDesign: customData || null
//     },
//   })
// }

//         >
//           Continue to Payment
//         </button>
//       </div>
//     </div>
//   );
// }
import  useCart  from "../../context/useCart";
import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Checkout() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const customData = location.state?.customDesign;
  const source = location.state?.source;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // 🔹 Load saved addresses
  useEffect(() => {
    API.get("/address").then((res) => {
      setAddresses(res.data);
      const def = res.data.find((a) => a.isDefault);
      if (def) setSelectedAddress(def._id);
    });
  }, []);

  // 🔹 Price calculation (jewellery style)
  const priceBreakup = useMemo(() => {
    if (source === "custom" && customData) {
      const gst = customData.price * 0.03;
      return {
        gold: customData.price,
        making: 0,
        stone: 0,
        gst,
        total: customData.price + gst,
      };
    }

    const gold = cart.reduce(
      (sum, i) => sum + i.product.price * i.qty,
      0
    );

    const making = cart.reduce(
      (sum, i) =>
        sum +
        (i.product.price *
          (i.product.makingChargePercent || 12)) /
          100 *
          i.qty,
      0
    );

    const stone = cart.reduce(
      (sum, i) => sum + (i.product.stonePrice || 0) * i.qty,
      0
    );

    const gst = (gold + making + stone) * 0.03;

    return {
      gold,
      making,
      stone,
      gst,
      total: gold + making + stone + gst,
    };
  }, [cart, source, customData]);

  // 🔹 Empty cart protection
  if (source !== "custom" && cart.length === 0) {
    return <h2 style={{ padding: 40 }}>Your cart is empty 🛒</h2>;
  }

  const proceed = () => {
  const orderItems = cart.map(i => ({
    product: i.product._id,
    name: i.product.name,
    price: i.product.price,
    qty: i.qty,
    image: i.product.image,
  }));

  navigate("/checkout/payment", {
    state: {
      addressId: selectedAddress,
      priceBreakup,
      items: orderItems,   // ⭐⭐ THIS WAS MISSING ⭐⭐
    },
  });
};


  return (
    <div className="checkout-page">
      {/* ================= LEFT ================= */}
      <div className="checkout-left">
        <h2>Delivery Address</h2>

        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`address-card ${
              selectedAddress === addr._id ? "active" : ""
            }`}
            onClick={() => setSelectedAddress(addr._id)}
          >
            <strong>{addr.label}</strong>
            <p>{addr.house}, {addr.area}</p>
            <small>{addr.city} – {addr.pincode}</small>
               <p>{addr.state}</p>
            <p>{addr.name}</p>
            <p>📞 {addr.phone}</p>
          </div>
        ))}

        <button
          className="add-new-btn"
          onClick={() => navigate("/account/addresses")}
        >
          + Add New Address
        </button>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="checkout-right">
        <h2>Order Summary</h2>


        {/* 🛒 CART FLOW */}
        {cart.map((i) => (
  <div key={i.product._id} className="summary-row">
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <img
        src={`http://localhost:5000/uploads/${i.product.image}`}
        width="60"
        style={{ borderRadius: 6 }}
      />
      <span>
        {i.product.name} × {i.qty}
      </span>
    </div>
    <span>₹{i.product.price * i.qty}</span>
  </div>
))}


        {/* 💍 CUSTOM DESIGN FLOW */}
        {source === "custom" && customData && (
          <div className="summary-row">
            <span>{customData.name}</span>
            <span>₹{customData.price}</span>
          </div>
        )}

        <hr />

        {/* 💰 PRICE BREAKUP */}
        <div className="bill-row">
          <span>Gold Value</span>
          <span>₹{priceBreakup.gold}</span>
        </div>
        <div className="bill-row">
          <span>Making Charges</span>
          <span>₹{priceBreakup.making}</span>
        </div>
        <div className="bill-row">
          <span>Stone Charges</span>
          <span>₹{priceBreakup.stone}</span>
        </div>
        <div className="bill-row">
          <span>GST (3%)</span>
          <span>₹{priceBreakup.gst.toFixed(0)}</span>
        </div>

        <hr />

        <div className="bill-row grand">
          <strong>Total</strong>
          <strong>₹{priceBreakup.total.toFixed(0)}</strong>
        </div>

        {/* 💳 PAYMENT METHOD */}
       <h3 style={{ marginTop: "1rem" }}>Payment Method</h3>

<label className="radio-row">
  <input
    type="radio"
    checked={paymentMethod === "COD"}
    onChange={() => setPaymentMethod("COD")}
  />
  Cash on Delivery
</label>

<label className="radio-row">
  <input
    type="radio"
    checked={paymentMethod === "ONLINE"}
    onChange={() => setPaymentMethod("ONLINE")}
  />
  Pay Online (UPI / Card)
</label>


        {/* 🔒 CTA */}
        <button
          className="place-order-btn"
          disabled={!selectedAddress}
          onClick={proceed}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
