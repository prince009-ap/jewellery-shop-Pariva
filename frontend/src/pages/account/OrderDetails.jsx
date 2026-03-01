import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import OrderTimeline from "../../components/order/OrderTimeline";





function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log("API CALL:", `/orders/${id}`);
        const res = await API.get(`/orders/${id}`);
        console.log("API RESPONSE:", res.data);
        setOrder(res.data);
      } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        alert("Order not found");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  // 🔹 Download invoice
  const downloadInvoice = async () => {
    if (!order?._id) return;
    
    try {
      console.log("API CALL:", `/orders/${order._id}/invoice`);
      const res = await API.get(`/orders/${order._id}/invoice`, {
        responseType: "blob",
      });
      console.log("Invoice downloaded successfully");

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to download invoice");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading order...</p>;
 if (!order) {
  return <p style={{ padding: 40 }}>Order not found</p>;
}


  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "auto" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <h2 style={{ marginTop: "1rem" }}>Order Details</h2>

      {/* ===== ORDER INFO ===== */}
      <div style={{ marginTop: "1rem" }}>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.orderStatus}</p>
        <p><strong>Payment:</strong> {order.payment?.method || "N/A"} ({order.paymentStatus})</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toDateString()}</p>
      </div>
{order?.orderStatus && (
  <OrderTimeline status={order.orderStatus} />
)}

{order.trackingHistory && (
  <>
    <h3>Shipment Tracking</h3>
    {order.trackingHistory.map((tracking, index) => (
      <div key={index} style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <p><strong>Status:</strong> {tracking.status}</p>
        <p><strong>Message:</strong> {tracking.message}</p>
        <p><strong>Date:</strong> {new Date(tracking.date).toDateString()}</p>
      </div>
    ))}
  </>
)}

      <hr />

      {/* ===== ITEMS ===== */}
      <h3>Items</h3>

      {order.items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <img
            src={`http://localhost:5000/uploads/${item.image}`}
            alt={item.name}
            width="80"
            style={{ borderRadius: 6 }}
          />

          <div style={{ flex: 1 }}>
            <strong>{item.name}</strong>
            <p>Quantity: {item.qty}</p>
          </div>

          <div>
            ₹{item.price * item.qty}
          </div>
        </div>
      ))}

      <hr />

      {/* ===== PRICE BREAKUP ===== */}
      <h3>Price Details</h3>

      <div style={{ maxWidth: 400 }}>
        <div className="bill-row">
          <span>Gold Value</span>
          <span>₹{order.priceBreakup.goldValue}</span>
        </div>
        <div className="bill-row">
          <span>Making Charges</span>
          <span>₹{order.priceBreakup.makingCharge}</span>
        </div>
        <div className="bill-row">
          <span>Stone Charges</span>
          <span>₹{order.priceBreakup.stoneCharge}</span>
        </div>
        <div className="bill-row">
          <span>GST</span>
          <span>₹{order.priceBreakup.gst}</span>
        </div>

        <hr />

        <div className="bill-row grand">
          <strong>Total</strong>
          <strong>₹{order.priceBreakup.totalAmount}</strong>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <button onClick={downloadInvoice}>
          Download Invoice (PDF)
        </button>

        {order.orderStatus === "pending" && (
          <button
            style={{ background: "#c62828", color: "#fff" }}
            onClick={async () => {
              try {
                console.log("API CALL:", `/orders/${order._id}/cancel`);
                const res = await API.put(`/orders/${order._id}/cancel`);
                console.log("API RESPONSE:", res.data);
                alert("Order cancelled");
                window.location.reload();
              } catch (error) {
                console.error("API ERROR:", error.response?.data || error.message);
                alert("Failed to cancel order");
              }
            }}
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderDetails;
