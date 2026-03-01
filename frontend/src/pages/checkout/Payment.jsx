import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api";
import "../../styles/loading.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { addressId, priceBreakup, items } = location.state || {};

  const [codLoading, setCodLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);

  // 🔒 SAFETY CHECK
  if (!addressId || !priceBreakup || !items || items.length === 0) {
    return <h2 style={{ padding: 40 }}>No items to order</h2>;
  }

  // ================= COD =================
  const placeCodOrder = async () => {
    if (codLoading) return;
    
    try {
      setCodLoading(true);
      await API.post("/orders/cod", {
        items,
        shippingAddress: addressId,
        priceBreakup: {
  goldValue: priceBreakup.gold,
  makingCharge: priceBreakup.making,
  stoneCharge: priceBreakup.stone,
  gst: priceBreakup.gst,
  totalAmount: priceBreakup.total,
},

      });

      alert("Order placed successfully (COD)");
      navigate("/account/orders");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Order failed");
    } finally {
      setCodLoading(false);
    }
  };

  // ================= ONLINE =================
  const payOnline = async () => {
    if (onlineLoading) return;
    
    try {
      setOnlineLoading(true);
      console.log("💳 Creating Razorpay order...");
      
      const { data: rzOrder } = await API.post("/payment/create-order", {
        amount: priceBreakup.total,
      });
      
      console.log("📋 Razorpay order created:", rzOrder);
      
      const order = rzOrder.order;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

  name: "PARIVA Jewellery",
  description: "Jewellery Purchase",
  image: "/logo.png",

  prefill: {
    name: "Customer",
    email: "customer@email.com",
    contact: "9999999999",
  },

  theme: {
    color: "#d4af37",
  },

  method: {
    upi: true,       // ✅ UPI enable
    card: true,
    netbanking: true,
    wallet: true,
  },

  config: {
    display: {
      blocks: {
        upi: {
          name: "Pay via UPI",
          instruments: [
            { method: "upi" },     // ✅ Shows UPI ID option
          ],
        },
      },
      sequence: ["block.upi", "block.card", "block.netbanking"],
      preferences: {
        show_default_blocks: true,
      },
    },
  },

  handler: async (response) => {
    console.log("🔥 Razorpay response:", response);
    
    try {
      console.log("📤 Sending verification request...");
      
      const { data } = await API.post("/payment/verify", {
        ...response,
        orderData: {
          shippingAddress: addressId,
          items,
          priceBreakup: {
            goldValue: priceBreakup.gold,
            makingCharge: priceBreakup.making,
            stoneCharge: priceBreakup.stone,
            gst: priceBreakup.gst,
            totalAmount: priceBreakup.total,
          },
        },
      });

      console.log("✅ Verification response:", data);

      if (data.success) {
        alert("Payment Successful! Order ID: " + data.orderId);
        navigate("/account/orders");
      } else {
        alert("Payment verification failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Verification error:", err.response?.data || err);
      alert("Payment verification failed: " + (err.response?.data?.message || "Network error"));
    }
  },
};

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Online payment failed");
    } finally {
      setOnlineLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 500, margin: "auto" }}>
      <h2>Payment</h2>

      <div style={{ border: "1px solid #ddd", padding: "1rem" }}>
        <p>Gold: ₹{priceBreakup.gold}</p>
        <p>Making: ₹{priceBreakup.making}</p>
        <p>Stone: ₹{priceBreakup.stone}</p>
        <p>GST: ₹{priceBreakup.gst}</p>
        <hr />
        <h3>Total: ₹{priceBreakup.total}</h3>
      </div>

      <button
        style={{ 
          marginTop: "1rem", 
          width: "100%",
          padding: "1rem",
          backgroundColor: codLoading ? "#6b7280" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: codLoading ? "not-allowed" : "pointer",
          opacity: codLoading ? 0.8 : 1
        }}
        onClick={placeCodOrder}
        disabled={codLoading}
        className={codLoading ? 'button-loading' : ''}
      >
        {codLoading ? (
          <span className="button-loading-content">
            <span className="loading-spinner-small"></span>
            Placing Order...
          </span>
        ) : (
          'Cash on Delivery'
        )}
      </button>

      <button
        style={{ 
          marginTop: "0.5rem", 
          width: "100%",
          padding: "1rem",
          backgroundColor: onlineLoading ? "#6b7280" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: onlineLoading ? "not-allowed" : "pointer",
          opacity: onlineLoading ? 0.8 : 1
        }}
        onClick={payOnline}
        disabled={onlineLoading}
        className={onlineLoading ? 'button-loading' : ''}
      >
        {onlineLoading ? (
          <span className="button-loading-content">
            <span className="loading-spinner-small"></span>
            Processing...
          </span>
        ) : (
          'Pay Online (UPI / Card)'
        )}
      </button>
    </div>
  );
}
