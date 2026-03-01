import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";

function AdminOrderDetails() {
  
  const { id } = useParams();
  const navigate = useNavigate();
    
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tracking, setTracking] = useState({
    courier: "",
    trackingId: "",
    status: "Order Placed",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        console.log("API CALL:", `/orders/admin/${id}`);
        console.log("Order ID from params:", id);
        const res = await adminAPI.get(`/orders/admin/${id}`);
        console.log("API RESPONSE:", res.data);
        if (isMounted) {
          console.log("📥 Order details received:", res.data);
          setOrder(res.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("API ERROR:", error.response?.data || error.message);
        console.error("❌ Order not found:", error);
        alert("Order not found: " + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const normalizedStatus = status.toLowerCase();
      console.log("Sending normalized status:", normalizedStatus);
      if (!order?._id) return;
      
      setUpdatingStatus(true);
      
console.log("API CALL:", `/orders/admin/${order._id}/status`);
      const res = await adminAPI.put(`/orders/admin/${order._id}/status`, {
        status: normalizedStatus
      });
      console.log("API RESPONSE:", res.data);
      
      // 🔄 reload order after update
      console.log("API CALL:", `/orders/admin/${order._id}`);
      const updatedRes = await adminAPI.get(`/orders/admin/${order._id}`);
      console.log("Updated order:", updatedRes.data);
      setOrder(updatedRes.data);
      alert("Status updated successfully!");
    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);
      console.error("Failed to update order status", err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
  pending: { color: "#f59e0b", bgColor: "#fef3c7", icon: "⏳" },
  confirmed: { color: "#10b981", bgColor: "#d1fae5", icon: "✅" },
  shipped: { color: "#3b82f6", bgColor: "#dbeafe", icon: "📦" },
  delivered: { color: "#8b5cf6", bgColor: "#ede9fe", icon: "🎉" },
  cancelled: { color: "#ef4444", bgColor: "#fee2e2", icon: "❌" }
};
   const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return {
      ...config,
      status
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusBadge = getStatusBadge(order.orderStatus);

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "1200px", 
      margin: "auto",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
        >
          ← Back to Orders
        </button>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: statusBadge.bgColor,
          color: statusBadge.color,
          borderRadius: "20px",
          fontSize: "1rem",
          fontWeight: "600"
        }}>
          <span>{statusBadge.icon}</span>
          {statusBadge.status}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem"
      }}>
        {/* Order Info Card */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{
            margin: "0 0 1rem 0",
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#111827"
          }}>
            Order Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Order ID
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                #{order._id?.slice(-8).toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Order Date
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "500", color: "#111827" }}>
                {formatDate(order.createdAt)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Payment Method
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "500", color: "#111827" }}>
                {(() => {
                  console.log("Payment object:", order.payment);
                  return order.payment?.method || "N/A";
                })()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Payment Status
              </div>
              <div style={{ 
                fontSize: "1rem", 
                fontWeight: "600", 
                color: order.payment?.status === "paid" ? "#10b981" : "#f59e0b"
              }}>
                {order.payment?.status || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{
            margin: "0 0 1rem 0",
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#111827"
          }}>
            Customer Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Name
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                {order.user?.name || "N/A"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Email
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "500", color: "#111827" }}>
                {order.user?.email || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <h3 style={{
          margin: "0 0 1rem 0",
          fontSize: "1.125rem",
          fontWeight: "600",
          color: "#111827"
        }}>
          Delivery Address
        </h3>
        <div style={{
          backgroundColor: "#f9fafb",
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "1rem",
          lineHeight: "1.6",
          color: "#111827"
        }}>
          {order.shippingAddress ? (
            <>
              <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                {order.shippingAddress.name}
              </div>
              <div>{order.shippingAddress.address}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</div>
              <div style={{ marginTop: "0.5rem" }}>
                📱 {order.shippingAddress.phone}
              </div>
            </>
          ) : (
            <div style={{ color: "#6b7280" }}>No address available</div>
          )}
        </div>
      </div>

      {/* Order Items Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <h3 style={{
          margin: "0 0 1.5rem 0",
          fontSize: "1.125rem",
          fontWeight: "600",
          color: "#111827"
        }}>
          Order Items
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {order.items?.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}
            >
              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                width="80"
                height="80"
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}
                alt={item.name}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.5rem"
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginBottom: "0.25rem"
                }}>
                  Quantity: {item.qty}
                </div>
                <div style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginBottom: "0.5rem"
                }}>
                  Metal: {item.metal || "N/A"}
                </div>
                <div style={{
                  fontSize: "1.125rem",
                  fontWeight: "700",
                  color: "#111827"
                }}>
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <h3 style={{
          margin: "0 0 1rem 0",
          fontSize: "1.125rem",
          fontWeight: "600",
          color: "#111827"
        }}>
          Price Summary
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {order.priceBreakup && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Gold Value:</span>
                <span style={{ fontWeight: "500" }}>₹{order.priceBreakup.goldValue?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Making Charge:</span>
                <span style={{ fontWeight: "500" }}>₹{order.priceBreakup.makingCharge?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Stone Charge:</span>
                <span style={{ fontWeight: "500" }}>₹{order.priceBreakup.stoneCharge?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>GST:</span>
                <span style={{ fontWeight: "500" }}>₹{order.priceBreakup.gst?.toLocaleString('en-IN') || 0}</span>
              </div>
            </>
          )}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "0.75rem",
            borderTop: "2px solid #e5e7eb"
          }}>
            <span style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827" }}>Total Amount:</span>
            <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827" }}>
              ₹{order.priceBreakup?.totalAmount?.toLocaleString('en-IN') || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Order Management Card */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{
          margin: "0 0 1.5rem 0",
          fontSize: "1.125rem",
          fontWeight: "600",
          color: "#111827"
        }}>
          Order Management
        </h3>
        
        {/* Update Status */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "600",
            color: "#374151",
            fontSize: "0.875rem"
          }}>
            Update Order Status
          </label>
          <select
            value={order.orderStatus}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updatingStatus}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              backgroundColor: updatingStatus ? "#e9ecef" : "white",
              opacity: updatingStatus ? 0.7 : 1
            }}
          >
            <option value="pending">Pending</option>
<option value="confirmed">Confirmed</option>
<option value="shipped">Shipped</option>
<option value="delivered">Delivered</option>
<option value="cancelled">Cancelled</option>
          </select>
          {updatingStatus && (
            <div style={{ 
              marginTop: "0.5rem", 
              fontSize: "0.875rem", 
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div className="loading-spinner loading-spinner-small"></div>
              Updating status...
            </div>
          )}
        </div>

        {/* Tracking Info */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "1rem",
            fontWeight: "600",
            color: "#374151",
            fontSize: "0.875rem"
          }}>
            Shipment Tracking
          </label>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem"
          }}>
            <input
              placeholder="Courier Name"
              value={tracking.courier}
              onChange={(e) => setTracking({ ...tracking, courier: e.target.value })}
              style={{
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
            <input
              placeholder="Tracking ID"
              value={tracking.trackingId}
              onChange={(e) => setTracking({ ...tracking, trackingId: e.target.value })}
              style={{
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem"
              }}
            />
          </div>
          <select
            value={tracking.status}
            onChange={(e) => setTracking({ ...tracking, status: e.target.value })}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              marginBottom: "1rem",
              backgroundColor: "white"
            }}
          >
            <option value="Order Placed">Order Placed</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button
            onClick={() => {
              console.log("API CALL:", `/orders/admin/${order._id}/tracking`);
              adminAPI.put(`/orders/admin/${order._id}/tracking`, tracking)
                .then((res) => {
                  console.log("API RESPONSE:", res.data);
                  alert("Tracking information saved");
                })
                .catch((err) => {
                  console.error("API ERROR:", err.response?.data || err.message);
                  alert("Failed to save tracking");
                });
            }}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}
          >
            Save Tracking Information
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetails;
