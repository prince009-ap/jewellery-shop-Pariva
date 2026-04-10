import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import OrderTimeline from "../../components/order/OrderTimeline";
import ReviewForm from "../../components/ReviewForm";
import "../../styles/loading.css";

const getProductId = (itemOrProduct) => {
  if (!itemOrProduct) return null;

  if (typeof itemOrProduct === "string") {
    return itemOrProduct;
  }

  if (itemOrProduct.productId || itemOrProduct.product) {
    return getProductId(itemOrProduct.productId || itemOrProduct.product);
  }

  return itemOrProduct._id || itemOrProduct.id || null;
};

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [orderReviews, setOrderReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("success");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Order load failed:", error.response?.data || error.message);
        alert("Order not found");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!order?._id) return;

    const checkReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await API.get(`/reviews/order/${order._id}`);
        if (res.data.success) {
          setReviewedProducts(res.data.data.map((r) => getProductId(r.productId)).filter(Boolean));
          setOrderReviews(res.data.data);
        }
      } catch (err) {
        console.error("Review check failed", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    checkReviews();
  }, [order]);

  useEffect(() => {
    if (!reviewMessage) return undefined;

    const timer = window.setTimeout(() => {
      setReviewMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [reviewMessage]);

  const openReviewModal = (productId) => {
    setSelectedProductForReview(productId);
    setReviewMessage("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductForReview(null);
  };

  const handleReviewSubmitted = (newReview) => {
    setReviewedProducts((prev) => [...prev, selectedProductForReview]);
    setOrderReviews((prev) => [...prev, newReview]);
    setReviewMessage("Review submitted successfully.");
    setReviewMessageType("success");
    closeReviewModal();
  };

  const downloadInvoice = async () => {
    if (!order?._id) return;

    try {
      const res = await API.get(`/orders/${order._id}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Invoice download failed:", error.response?.data || error.message);
      alert("Failed to download invoice");
    }
  };

  const cancelOrder = async () => {
    if (!order?._id) return;

    try {
      await API.put(`/orders/${order._id}/cancel`);
      alert("Order cancelled");
      navigate("/account/orders", { replace: true });
    } catch (error) {
      console.error("Cancel order failed:", error.response?.data || error.message);
      alert("Failed to cancel order");
    }
  };

  const formatFullAddress = (address) => {
    if (!address) return "Address not available";

    const parts = [
      address.name,
      address.address || address.house,
      address.city,
      address.state,
      address.pincode ? `${address.pincode}` : null,
      address.phone ? `Phone: ${address.phone}` : null,
    ].filter(Boolean);

    return parts.join(", ");
  };

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

  const isDelayedOrder = (currentOrder) => {
    const status = String(currentOrder?.orderStatus || "").toLowerCase();
    return ["pending", "confirmed"].includes(status) && getOrderAgeInDays(currentOrder.createdAt) >= 7;
  };

  const isDelayedShipment = (currentOrder) => {
    const status = String(currentOrder?.orderStatus || "").toLowerCase();
    return status === "shipped" && getShippedAgeInDays(currentOrder) >= 7;
  };

  if (loading) return <p style={{ padding: 40 }}>Loading order...</p>;
  if (!order) return <p style={{ padding: 40 }}>Order not found</p>;
  const delayedOrder = isDelayedOrder(order);
  const orderAgeDays = getOrderAgeInDays(order.createdAt);
  const delayedShipment = isDelayedShipment(order);
  const shippedAgeDays = getShippedAgeInDays(order);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "auto" }}>
      <button
        type="button"
        className="order-details-top-action"
        onClick={() => navigate("/account/orders")}
      >
        Back to Orders
      </button>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1.5rem",
          marginTop: "1rem",
        }}
      >
        {reviewMessage ? (
          <div className={`checkout-inline-message ${reviewMessageType}`}>
            {reviewMessage}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ margin: 0, color: "#333" }}>Order Details</h3>
          <button
            type="button"
            className="order-details-close-btn"
            onClick={() => navigate("/account/orders")}
          >
            ×
          </button>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Order ID</p>
              <p style={{ margin: "0", fontWeight: "600" }}>{order._id}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Status</p>
              <span style={getStatusBadgeStyle(order.orderStatus)}>{order.orderStatus}</span>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Payment Method</p>
              <p style={{ margin: "0" }}>{order.payment?.method || "N/A"} ({order.paymentStatus})</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Order Date</p>
              <p style={{ margin: "0" }}>{new Date(order.createdAt).toDateString()}</p>
            </div>
          </div>
        </div>

        {order.orderStatus && (
          <div style={{ marginBottom: "1.5rem" }}>
            <OrderTimeline status={order.orderStatus} />
          </div>
        )}

        {delayedOrder && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.1rem",
              backgroundColor: "#fff4f5",
              border: "1px solid #f3c7cd",
              borderRadius: "10px",
              color: "#9f1239",
            }}
          >
            <strong>Delivery delayed:</strong> This order is {orderAgeDays} days old and still not shipped.
            Please contact support or ask admin to update shipping status.
          </div>
        )}

        {delayedShipment && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem 1.1rem",
              backgroundColor: "#eef4ff",
              border: "1px solid #c7daf8",
              borderRadius: "10px",
              color: "#1d4ed8",
            }}
          >
            <strong>Shipment delayed:</strong> This order was shipped {shippedAgeDays} days ago but is
            still not marked delivered. Please contact support if you have already received it.
          </div>
        )}

        {order.trackingHistory && (
          <>
            <h3>Shipment Tracking</h3>
            {order.shipmentTracking ? (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#eef6ff",
                  border: "1px solid #c9def5",
                  borderRadius: "8px",
                }}
              >
                <p><strong>Courier:</strong> {order.shipmentTracking.courier || "Awaiting dispatch"}</p>
                <p><strong>Tracking ID:</strong> {order.shipmentTracking.trackingId || "Will be generated after shipment"}</p>
                <p><strong>Live Status:</strong> {order.shipmentTracking.status || "Order placed"}</p>
              </div>
            ) : null}
            {order.trackingHistory.map((tracking, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                }}
              >
                <p><strong>Status:</strong> {tracking.status}</p>
                <p><strong>Message:</strong> {tracking.message}</p>
                <p><strong>Date:</strong> {new Date(tracking.date).toDateString()}</p>
              </div>
            ))}
          </>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Delivery Address</h4>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "6px",
              lineHeight: "1.6",
            }}
          >
            {formatFullAddress(order.shippingAddress)}
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Items</h4>

          {order.items?.map((item, index) => {
            const productId = getProductId(item);
            const hasReviewed = reviewedProducts.includes(productId);

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  alignItems: "center",
                }}
              >
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.name}
                  width="60"
                  style={{ borderRadius: "6px", objectFit: "cover" }}
                />

                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                    {item.name}
                  </strong>

                  <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                    Qty: {item.qty} {item.metal && `| Metal: ${item.metal}`}
                  </p>

                  {order.orderStatus?.toLowerCase() === "delivered" &&
                    (hasReviewed ? (
                      <span style={{ color: "green", fontSize: "13px" }}>
                        Review Submitted
                      </span>
                    ) : (
                      <button
                        style={{
                          marginTop: "6px",
                          padding: "4px 10px",
                          background: "#d4af37",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        onClick={() => openReviewModal(productId)}
                      >
                        Write Review
                      </button>
                    ))}
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong style={{ color: "#d4af37" }}>
                    Rs.{(item.price * item.qty).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {order.orderStatus?.toLowerCase() === "delivered" && (
          <div style={{ marginTop: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>
              Reviews for this Order ({orderReviews.length})
            </h4>

            {reviewsLoading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                <div className="loading-spinner loading-spinner-small"></div>
                Loading reviews...
              </div>
            ) : orderReviews.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>*</div>
                <p style={{ margin: "0", fontSize: "16px" }}>No reviews yet for this order</p>
                <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#666" }}>
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {orderReviews.map((review) => (
                  <div
                    key={review._id}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "1rem",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#666",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {review.userId?.name?.charAt(0)?.toUpperCase() || "Y"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}>
                            You
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {review.userId?.email || ""}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#ffc107", fontSize: "16px" }}>
                            {"*".repeat(review.rating)}
                          </span>
                          <span style={{ fontSize: "12px", color: "#666", marginLeft: "4px" }}>
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#f8f9fa",
                        padding: "12px",
                        borderRadius: "6px",
                        borderLeft: "3px solid #3b82f6",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        color: "#333",
                      }}
                    >
                      {review.comment}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Price Details</h4>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: "6px",
              maxWidth: "400px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Gold Value:</span>
              <span>Rs.{(order.priceBreakup?.goldValue || 0).toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Making Charges:</span>
              <span>Rs.{(order.priceBreakup?.makingCharge || 0).toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>Stone Charges:</span>
              <span>Rs.{(order.priceBreakup?.stoneCharge || 0).toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span>GST:</span>
              <span>Rs.{(order.priceBreakup?.gst || 0).toLocaleString("en-IN")}</span>
            </div>
            <hr style={{ margin: "0.5rem 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              <span>Total:</span>
              <span style={{ color: "#d4af37" }}>
                Rs.{(order.priceBreakup?.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        <div className="order-details-actions-row">
          <button
            type="button"
            className="order-details-primary-btn"
            onClick={downloadInvoice}
          >
            Download Invoice
          </button>

          {order.orderStatus === "pending" && (
            <button
              type="button"
              className="order-details-danger-btn"
              onClick={cancelOrder}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {showReviewModal && selectedProductForReview && (
        <div className="page-loading-overlay">
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <ReviewForm
              productId={selectedProductForReview}
              orderId={order._id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={closeReviewModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
