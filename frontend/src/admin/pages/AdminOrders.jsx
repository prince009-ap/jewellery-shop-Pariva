
import { useEffect, useState } from "react";
import adminAPI from "../../services/adminApi";
import { useNavigate } from "react-router-dom";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("API CALL:", "/orders/admin/all");
      const res = await adminAPI.get("/orders/admin/all");
      console.log("API RESPONSE:", res.data);
      setOrders(res.data);
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      console.log("📌 Updating order status:", orderId);
      console.log("📌 New status:", newStatus);
      
      const normalizedStatus = newStatus.toLowerCase();
      console.log("Sending normalized status:", normalizedStatus);
      
      console.log("API CALL:", `/orders/admin/${orderId}/status`);
      const res = await adminAPI.put(`/orders/admin/${orderId}/status`, { status: normalizedStatus });
      console.log("API RESPONSE:", res.data);
      
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      console.error("Failed to update status:", error);
      if (!error.response?.data?.success) {
  alert("Failed to update order status");
}
    }
  };

  const removeOrder = async (orderId) => {
    try {
      console.log("API CALL:", `/orders/admin/${orderId}`);
      const res = await adminAPI.delete(`/orders/admin/${orderId}`);
      console.log("API RESPONSE:", res.data);
      alert("Order removed successfully");
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to remove order");
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
  status: status?.toUpperCase()
};
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: []
};

return statusFlow[currentStatus?.toLowerCase()] || [];
   
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
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        fontSize: "1.125rem",
        color: "#6b7280"
      }}>
        Loading orders...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem",
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
        <h1 style={{
          margin: 0,
          fontSize: "2rem",
          fontWeight: "700",
          color: "#111827"
        }}>
          All Orders
        </h1>
        <div style={{
          backgroundColor: "#e5e7eb",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
          color: "#6b7280"
        }}>
          Total: {orders.length} orders
        </div>
      </div>

      {/* Orders Grid */}
      <div style={{
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))"
      }}>
        {orders.map((order) => {
          console.log("📦 Admin Order Object:", order);
          console.log("💳 Payment Method:", order.payment?.method);
          const statusBadge = getStatusBadge(order.orderStatus);
          const nextStatuses = getNextStatuses(order.orderStatus);
          
          return (
            <div
              key={order._id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
            >
              {/* Order Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1rem"
              }}>
                <div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem"
                  }}>
                    Order ID
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827"
                  }}>
                    #{order._id?.slice(-8).toUpperCase()}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.75rem",
                  backgroundColor: statusBadge.bgColor,
                  color: statusBadge.color,
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>
                  <span>{statusBadge.icon}</span>
                  {statusBadge.status}
                </div>
              </div>

              {/* Customer Info */}
              <div style={{
                marginBottom: "1rem",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "8px"
              }}>
                <div style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginBottom: "0.5rem"
                }}>
                  Customer
                </div>
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: "0.25rem"
                }}>
                  {order.user?.name || "Unknown Customer"}
                </div>
                <div style={{
                  fontSize: "0.875rem",
                  color: "#6b7280"
                }}>
                  {order.user?.email || "No email"}
                </div>
              </div>

              {/* Order Details */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                marginBottom: "1rem"
              }}>
                <div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem"
                  }}>
                    Total Amount
                  </div>
                  <div style={{
                    fontSize: "1.125rem",
                    fontWeight: "700",
                    color: "#111827"
                  }}>
                    ₹{order.priceBreakup?.totalAmount?.toLocaleString('en-IN') || "0"}
                  </div>
                </div>
                
                <div>
                  <div style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "0.25rem"
                  }}>
                    Payment Method
                  </div>
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#111827"
                  }}>
                    {order.payment?.method || "N/A"}
                  </div>
                </div>
              </div>

              {/* Order Date */}
              <div style={{
                fontSize: "0.875rem",
                    color: "#6b7280",
                marginBottom: "1rem"
              }}>
                <strong>Order Date:</strong> {formatDate(order.createdAt)}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap"
              }}>
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      console.log("📌 Updating order status:", order._id);
                      updateStatus(order._id, status);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backgroundColor: status === "Cancelled" ? "#fee2e2" : "#dbeafe",
                      color: status === "Cancelled" ? "#dc2626" : "#2563eb"
                    }}
                  >
                    {status === "Cancelled" ? "❌ Cancel" : `✓ Mark ${status}`}
                  </button>
                ))}
                
                {/* Remove Order Button - Only for Cancelled Orders */}
                {order.orderStatus === "cancelled" && (
                  <button
                    onClick={() => {
                      console.log("🗑️ Removing order:", order._id);
                      if (window.confirm("Are you sure you want to remove this cancelled order?")) {
                        removeOrder(order._id);
                      }
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      transition: "all 0.2s ease"
                    }}
                  >
                    🗑️ Remove Order
                  </button>
                )}
                
                <button
                  onClick={() => {
                    console.log("🔗 Navigating to order ID:", order._id);
                    navigate(`/admin/orders/${order._id}`);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    backgroundColor: "white",
                    color: "#6b7280",
                    transition: "all 0.2s ease"
                  }}
                >
                  📄 View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          color: "#6b7280",
          fontSize: "1.125rem"
        }}>
          No orders found
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
