import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../../styles/loading.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingOrderId, setRemovingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    if (cancellingOrderId) return;

    setCancellingOrderId(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      alert("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error.response?.data || error.message);
      alert("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const removeOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this cancelled order? This action cannot be undone.")) return;

    setRemovingOrderId(orderId);
    try {
      await API.delete(`/orders/${orderId}`);
      alert("Order removed successfully");
      fetchOrders();
    } catch (error) {
      console.error("Failed to remove order:", error.response?.data || error.message);
      alert("Failed to remove order");
    } finally {
      setRemovingOrderId(null);
    }
  };

  const getPreviewItem = (order) => order.items?.[0] || null;

  const getImageSrc = (image) => (image ? `http://localhost:5000/uploads/${image}` : null);

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      display: "inline-block",
    };

    switch (status?.toLowerCase()) {
      case "delivered":
        return { ...baseStyle, backgroundColor: "#4caf50", color: "white" };
      case "cancelled":
        return { ...baseStyle, backgroundColor: "#f44336", color: "white" };
      case "shipped":
        return { ...baseStyle, backgroundColor: "#2196f3", color: "white" };
      case "confirmed":
        return { ...baseStyle, backgroundColor: "#ff9800", color: "white" };
      default:
        return { ...baseStyle, backgroundColor: "#9e9e9e", color: "white" };
    }
  };

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
    <div className="orders-page">
      <div className="orders-page__header">
        <h2>My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty-state">
          <p style={{ fontSize: "18px", color: "#666", margin: 0 }}>No orders yet</p>
        </div>
      ) : (
        <div className="orders-list-panel">
          <div className="orders-section-head">
            <h3>Order History</h3>
            <span>{orders.length} orders</span>
          </div>

          <div className="orders-list">
            {orders.map((order) => {
              const previewItem = getPreviewItem(order);

              return (
                <div
                  key={order._id}
                  className="order-summary-card order-summary-card--with-image"
                  onClick={() => navigate(`/account/orders/${order._id}`)}
                >
                  <div className="order-summary-card__media">
                    {previewItem?.image ? (
                      <img
                        src={getImageSrc(previewItem.image)}
                        alt={previewItem.name || "Ordered item"}
                        className="order-summary-card__image"
                      />
                    ) : (
                      <div className="order-summary-card__image-fallback">No Image</div>
                    )}
                  </div>

                  <div className="order-summary-card__content">
                    <div className="order-summary-card__top">
                      <div>
                        <p className="order-summary-card__label">Order ID</p>
                        <h4>{order._id.slice(-8)}</h4>
                        <span style={getStatusBadgeStyle(order.orderStatus)}>{order.orderStatus}</span>
                      </div>

                      <div className="order-summary-card__amount">
                        <strong>Rs.{order.priceBreakup?.totalAmount?.toLocaleString("en-IN") || 0}</strong>
                        <span>{new Date(order.createdAt).toDateString()}</span>
                      </div>
                    </div>

                    <div className="order-summary-card__body order-summary-card__body--stacked">
                      <div className="order-summary-card__item-meta">
                        <p className="order-summary-card__item-name">
                          {previewItem?.name || "Ordered item"}
                        </p>
                        <p className="order-summary-card__item-count">
                          {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="order-summary-card__actions">
                      {order.orderStatus === "pending" && (
                        <button
                          type="button"
                          className="order-action-btn danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelOrder(order._id);
                          }}
                          disabled={cancellingOrderId === order._id}
                        >
                          {cancellingOrderId === order._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}

                      {order.orderStatus?.toLowerCase() === "cancelled" && (
                        <button
                          type="button"
                          className="order-action-btn muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOrder(order._id);
                          }}
                          disabled={removingOrderId === order._id}
                        >
                          {removingOrderId === order._id ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
