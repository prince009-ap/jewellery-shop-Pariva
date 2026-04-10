import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import "./AdminOrderDetails.css";

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PROGRESS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

const toTitle = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const toastTimerRef = useRef(null);
  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ open: false, message: "", type: "success" });
    }, 2400);
  };

  const getOrderAgeInDays = (dateString) => {
    const createdAt = new Date(dateString);
    const diffMs = Date.now() - createdAt.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  const getShippedAgeInDays = (currentOrder) => {
    const shippedEntry = [...(currentOrder?.trackingHistory || [])]
      .reverse()
      .find((entry) => String(entry.status || "").toLowerCase() === "shipped");
    const referenceDate =
      shippedEntry?.date ||
      currentOrder?.shipmentTracking?.lastUpdatedAt ||
      currentOrder?.updatedAt ||
      currentOrder?.createdAt;
    return getOrderAgeInDays(referenceDate);
  };

  useEffect(
    () => () => {
      window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      try {
        const res = await adminAPI.get(`/orders/admin/${id}`);
        if (isMounted) {
          setOrder(res.data);
          setLoading(false);
        }
      } catch {
        showToast("Order not found", "error");
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
      if (!order?._id) return;

      setUpdatingStatus(true);

      await adminAPI.put(`/orders/admin/${order._id}/status`, {
        status: normalizedStatus,
      });

      const updatedRes = await adminAPI.get(`/orders/admin/${order._id}`);
      setOrder(updatedRes.data);
      showToast("Status updated successfully");
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAllowedStatuses = (currentStatusRaw) => {
    const current = (currentStatusRaw || "").toLowerCase();

    if (current === "cancelled") return ["cancelled"];
    if (current === "delivered") return ["delivered"];

    const idx = PROGRESS_FLOW.indexOf(current);
    if (idx === -1) return ORDER_STATUSES;

    return [...PROGRESS_FLOW.slice(idx), "cancelled"];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "#92400e", bgColor: "#fef3c7", icon: "P" },
      confirmed: { color: "#065f46", bgColor: "#d1fae5", icon: "C" },
      shipped: { color: "#1e40af", bgColor: "#dbeafe", icon: "S" },
      delivered: { color: "#6d28d9", bgColor: "#ede9fe", icon: "D" },
      cancelled: { color: "#991b1b", bgColor: "#fee2e2", icon: "X" },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return {
      ...config,
      status,
    };
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
  const allowedStatuses = getAllowedStatuses(order.orderStatus);
  const isFinalStatus = ["delivered", "cancelled"].includes((order.orderStatus || "").toLowerCase());
  const orderAgeDays = getOrderAgeInDays(order.createdAt);
  const isOverdue = ["pending", "confirmed"].includes((order.orderStatus || "").toLowerCase()) && orderAgeDays >= 7;
  const isDelayedShipment = (order.orderStatus || "").toLowerCase() === "shipped" && getShippedAgeInDays(order) >= 7;
  const shippedAgeDays = getShippedAgeInDays(order);
  const shipmentTracking = order.shipmentTracking || {};

  return (
    <div className="aod-page">
      {toast.open && (
        <div className={`aod-toast aod-toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      <div className="aod-shell">
        <nav className="aod-breadcrumb">
          <button
            type="button"
            className="aod-crumb-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <button
            type="button"
            className="aod-crumb-btn"
            onClick={() => navigate("/admin/orders", { replace: true })}
          >
            Orders
          </button>
          <span>&gt;</span>
          <span>Details</span>
        </nav>

        <header className="aod-header">
          <button
            type="button"
            className="aod-btn aod-btn-neutral"
            onClick={() => navigate("/admin/orders", { replace: true })}
          >
            Back to Orders
          </button>

          <div
            className="aod-status-pill"
            style={{ backgroundColor: statusBadge.bgColor, color: statusBadge.color }}
          >
            <span>{statusBadge.icon}</span>
            <span>{statusBadge.status}</span>
          </div>
        </header>

        {isOverdue && (
          <div className="aod-overdue-banner">
            This order is overdue by process standards: {orderAgeDays} days old and still not shipped.
            Update status or add shipment tracking for the customer.
          </div>
        )}

        {isDelayedShipment && (
          <div className="aod-overdue-banner aod-shipped-delay-banner">
            This order was shipped {shippedAgeDays} days ago but is still not marked delivered.
            If customer has received it, update status to delivered.
          </div>
        )}

        <section className="aod-grid-two">
          <article className="aod-card">
            <h3>Order Information</h3>
            <div className="aod-stack">
              <div>
                <p className="aod-label">Order ID</p>
                <p className="aod-value">#{order._id?.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="aod-label">Order Date</p>
                <p className="aod-value">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="aod-label">Payment Method</p>
                <p className="aod-value">{order.payment?.method || "N/A"}</p>
              </div>
              <div>
                <p className="aod-label">Payment Status</p>
                <p className={`aod-value ${order.payment?.status === "paid" ? "aod-paid" : "aod-pending"}`}>
                  {order.payment?.status || "N/A"}
                </p>
              </div>
            </div>
          </article>

          <article className="aod-card">
            <h3>Customer Information</h3>
            <div className="aod-stack">
              <div>
                <p className="aod-label">Name</p>
                <p className="aod-value">{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="aod-label">Email</p>
                <p className="aod-value">{order.user?.email || "N/A"}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="aod-card">
          <h3>Delivery Address</h3>
          <div className="aod-surface">
            {order.shippingAddress ? (
              <>
                <p className="aod-value">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </>
            ) : (
              <p className="aod-muted">No address available</p>
            )}
          </div>
        </section>

        <section className="aod-card">
          <h3>Order Items</h3>
          <div className="aod-items-list">
            {order.items?.map((item, i) => (
              <article className="aod-item" key={i}>
                <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
                <div>
                  <p className="aod-item-name">{item.name}</p>
                  <p className="aod-item-meta">Quantity: {item.qty}</p>
                  <p className="aod-item-meta">Metal: {item.metal || "N/A"}</p>
                </div>
                <p className="aod-item-price">Rs {(item.price * item.qty).toLocaleString("en-IN")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="aod-card">
          <h3>Price Summary</h3>
          <div className="aod-summary">
            {order.priceBreakup && (
              <>
                <div className="aod-row">
                  <span>Gold Value</span>
                  <strong>Rs {order.priceBreakup.goldValue?.toLocaleString("en-IN") || 0}</strong>
                </div>
                <div className="aod-row">
                  <span>Making Charge</span>
                  <strong>Rs {order.priceBreakup.makingCharge?.toLocaleString("en-IN") || 0}</strong>
                </div>
                <div className="aod-row">
                  <span>Stone Charge</span>
                  <strong>Rs {order.priceBreakup.stoneCharge?.toLocaleString("en-IN") || 0}</strong>
                </div>
                <div className="aod-row">
                  <span>GST</span>
                  <strong>Rs {order.priceBreakup.gst?.toLocaleString("en-IN") || 0}</strong>
                </div>
              </>
            )}
            <div className="aod-total">
              <span>Total Amount</span>
              <strong>Rs {order.priceBreakup?.totalAmount?.toLocaleString("en-IN") || 0}</strong>
            </div>
          </div>
        </section>

        <section className="aod-card">
          <h3>Order Management</h3>

          <div className="aod-form-block">
            <label htmlFor="order-status">Update Order Status</label>
            <SelectDropdown
              id="order-status"
              value={order.orderStatus}
              onChange={(e) => {
                const nextStatus = e.target.value;
                if (!allowedStatuses.includes(nextStatus)) {
                  showToast("Previous status par wapas nahi ja sakte", "error");
                  return;
                }
                updateStatus(nextStatus);
              }}
              disabled={updatingStatus || isFinalStatus}
              options={ORDER_STATUSES.filter((status) => allowedStatuses.includes(status)).map((status) => ({
                value: status,
                label: toTitle(status),
              }))}
              className="aod-field"
            />
            {updatingStatus && (
              <div className="aod-updating">
                <div className="loading-spinner loading-spinner-small"></div>
                Updating status...
              </div>
            )}
            {isFinalStatus && (
              <div className="aod-updating">This order is in final status and can no longer be changed.</div>
            )}
          </div>

          <div className="aod-form-block">
            <label>Shipment Tracking</label>
            <div className="aod-tracking-box">
              <div className="aod-tracking-grid">
                <div>
                  <span className="aod-tracking-label">Courier</span>
                  <strong>{shipmentTracking.courier || "Auto-assign when order is shipped"}</strong>
                </div>
                <div>
                  <span className="aod-tracking-label">Tracking ID</span>
                  <strong>{shipmentTracking.trackingId || "Will be generated automatically"}</strong>
                </div>
                <div>
                  <span className="aod-tracking-label">Tracking Status</span>
                  <strong>{shipmentTracking.status || "Order placed"}</strong>
                </div>
                <div>
                  <span className="aod-tracking-label">Last Updated</span>
                  <strong>
                    {shipmentTracking.lastUpdatedAt
                      ? formatDate(shipmentTracking.lastUpdatedAt)
                      : "Not generated yet"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminOrderDetails;
