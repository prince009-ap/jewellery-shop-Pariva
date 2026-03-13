import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import "./AdminOrders.css";

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [pendingRemove, setPendingRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.get("/orders/admin/all");
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
      setUpdatingOrderId(orderId);
      const normalizedStatus = newStatus.toLowerCase();
      await adminAPI.put(`/orders/admin/${orderId}/status`, { status: normalizedStatus });
      fetchOrders();
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      console.error("Failed to update status:", error);
      if (!error.response?.data?.success) {
        alert("Failed to update order status");
      }
    } finally {
      setUpdatingOrderId("");
    }
  };

  const removeOrder = async (orderId) => {
    try {
      setRemoveLoading(true);
      await adminAPI.delete(`/orders/admin/${orderId}`);
      setPendingRemove(null);
      fetchOrders();
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to remove order");
    } finally {
      setRemoveLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#b45309", bgColor: "#fef3c7", label: "Pending" },
      confirmed: { color: "#047857", bgColor: "#d1fae5", label: "Confirmed" },
      shipped: { color: "#1d4ed8", bgColor: "#dbeafe", label: "Shipped" },
      delivered: { color: "#6d28d9", bgColor: "#ede9fe", label: "Delivered" },
      cancelled: { color: "#b91c1c", bgColor: "#fee2e2", label: "Cancelled" },
    };

    return statusConfig[status?.toLowerCase()] || statusConfig.pending;
  };

  const getNextStatuses = (currentStatus) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    return statusFlow[currentStatus?.toLowerCase()] || [];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOrderImageSrc = (order) => {
    const image = order.items?.[0]?.image;
    return image ? `http://localhost:5000/uploads/${image}` : "";
  };

  const sortedOrders = useMemo(() => {
    const arr = [...orders];

    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "amount_high":
        arr.sort(
          (a, b) =>
            Number(b.priceBreakup?.totalAmount || 0) - Number(a.priceBreakup?.totalAmount || 0)
        );
        break;
      case "amount_low":
        arr.sort(
          (a, b) =>
            Number(a.priceBreakup?.totalAmount || 0) - Number(b.priceBreakup?.totalAmount || 0)
        );
        break;
      case "status":
        arr.sort((a, b) => (a.orderStatus || "").localeCompare(b.orderStatus || ""));
        break;
      case "payment":
        arr.sort((a, b) =>
          (a.payment?.method || "").localeCompare(b.payment?.method || "")
        );
        break;
      case "latest":
      default:
        arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return arr;
  }, [orders, sortBy]);

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="ao-shell">
        <nav className="ao-breadcrumb">
          <button
            type="button"
            className="ao-crumb-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Orders</span>
        </nav>

        <header className="ao-header">
          <div>
            <p className="ao-kicker">PARIVA Fulfillment Hub</p>
            <h1>All Orders</h1>
            <p>Track and manage every order from one place.</p>
          </div>

          <div className="ao-meta">Total: {orders.length} orders</div>
        </header>

        <section className="ao-topbar-card">
          <div className="ao-sort-wrap">
            <label htmlFor="order-sort">Sort By</label>
            <select id="order-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest Orders</option>
              <option value="oldest">Oldest Orders</option>
              <option value="amount_high">Amount High-Low</option>
              <option value="amount_low">Amount Low-High</option>
              <option value="status">Status A-Z</option>
              <option value="payment">Payment Method A-Z</option>
            </select>
          </div>
        </section>

        <section className="ao-grid">
          {sortedOrders.map((order) => {
            const statusBadge = getStatusBadge(order.orderStatus);
            const nextStatuses = getNextStatuses(order.orderStatus);
            const isUpdating = updatingOrderId === order._id;

            return (
              <article className="ao-card" key={order._id}>
                <div className="ao-head">
                  <div className="ao-head-main">
                    {order.items?.[0]?.image ? (
                      <img
                        src={getOrderImageSrc(order)}
                        alt={order.items?.[0]?.name || "Order item"}
                        className="ao-order-image"
                      />
                    ) : null}
                    <div className="ao-head-copy">
                      <p className="ao-head-id">
                        <span className="ao-head-label-inline">Order ID:</span>{" "}
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div
                    className="ao-status-pill"
                    style={{ backgroundColor: statusBadge.bgColor, color: statusBadge.color }}
                  >
                    {statusBadge.label}
                  </div>
                </div>

                <div className="ao-customer-box">
                  <p className="ao-box-label">Customer</p>
                  <p className="ao-customer-name">{order.user?.name || "Unknown Customer"}</p>
                  <p className="ao-customer-email">{order.user?.email || "No email"}</p>
                </div>

                <div className="ao-metrics">
                  <div>
                    <p className="ao-metric-label">Total Amount</p>
                    <p className="ao-metric-value">
                      Rs {Number(order.priceBreakup?.totalAmount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="ao-metric-label">Payment Method</p>
                    <p className="ao-metric-value plain">{order.payment?.method || "N/A"}</p>
                  </div>
                </div>

                <p className="ao-date-row">
                  <strong>Order Date:</strong> {formatDate(order.createdAt)}
                </p>

                <div className="ao-actions">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      className={`ao-pill-btn ${status === "cancelled" ? "danger" : "info"}`}
                      disabled={isUpdating}
                      onClick={() => updateStatus(order._id, status)}
                    >
                      {status === "cancelled" ? "Cancel" : `Mark ${status}`}
                    </button>
                  ))}

                  {order.orderStatus === "cancelled" && (
                    <button
                      className="ao-pill-btn danger"
                      onClick={() => setPendingRemove(order)}
                      disabled={isUpdating}
                    >
                      Remove Order
                    </button>
                  )}

                  <button
                    className="ao-pill-btn neutral"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {orders.length === 0 && <div className="ao-empty">No orders found</div>}
      </div>

      {pendingRemove && (
        <div className="ao-modal-backdrop" role="dialog" aria-modal="true">
          <div className="ao-modal-card">
            <p className="ao-modal-kicker">Confirm Action</p>
            <h3>Remove cancelled order?</h3>
            <p>
              This will permanently remove order <strong>#{pendingRemove._id?.slice(-8).toUpperCase()}</strong>.
            </p>

            <div className="ao-modal-actions">
              <button
                className="ao-pill-btn neutral"
                onClick={() => setPendingRemove(null)}
                disabled={removeLoading}
              >
                Cancel
              </button>
              <button
                className="ao-pill-btn danger"
                onClick={() => removeOrder(pendingRemove._id)}
                disabled={removeLoading}
              >
                {removeLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
