import { useEffect, useState } from "react";
import API from "../../services/api";
import OrderTimeline from "../../components/order/OrderTimeline";
import ReviewForm from "../../components/ReviewForm";
import "../../styles/loading.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingOrderId, setRemovingOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
const [reviewedProducts, setReviewedProducts] = useState([]);
const [showReviewModal, setShowReviewModal] = useState(false);
const [selectedProductForReview, setSelectedProductForReview] = useState(null);
const [orderReviews, setOrderReviews] = useState([]);
const [reviewsLoading, setReviewsLoading] = useState(false);

useEffect(() => {
  if (!selectedOrder) return;

  const checkReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await API.get(`/reviews/order/${selectedOrder._id}`);
      if (res.data.success) {
        setReviewedProducts(res.data.data.map(r => r.productId));
        setOrderReviews(res.data.data);
      }
    } catch (err) {
      console.error("Review check failed", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  checkReviews();
}, [selectedOrder]);

  // Review modal functions
  const openReviewModal = (productId) => {
    setSelectedProductForReview(productId);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductForReview(null);
  };

  const handleReviewSubmitted = (newReview) => {
    setReviewedProducts(prev => [...prev, selectedProductForReview]);
    setOrderReviews(prev => [...prev, newReview]);
    closeReviewModal();
    alert('Review submitted successfully!');
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("API CALL:", "/orders/my");
      const res = await API.get("/orders/my");
      console.log("API RESPONSE:", res.data);
      setOrders(res.data);
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      console.log("API CALL:", `/orders/${orderId}/invoice`);
      const res = await API.get(`/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      console.log("Invoice downloaded successfully");

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to download invoice");
      console.error("Invoice download error:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    if (cancellingOrderId) return;
    
    setCancellingOrderId(orderId);
    try {
      console.log("API CALL:", `/orders/${orderId}/cancel`);
      const res = await API.put(`/orders/${orderId}/cancel`);
      console.log("API RESPONSE:", res.data);
      alert("Order cancelled successfully");
      fetchOrders(); // Refresh orders
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      alert("Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const removeOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this cancelled order? This action cannot be undone.")) return;
    
    setRemovingOrderId(orderId);
    try {
      console.log("API CALL:", `/orders/${orderId}`);
      const res = await API.delete(`/orders/${orderId}`);
      console.log("API RESPONSE:", res.data);
      alert("Order removed successfully");
      fetchOrders(); // Refresh orders
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("API ERROR:", error.response?.data || error.message);
      console.error("Remove order error:", error);
      alert("Failed to remove order");
    } finally {
      setRemovingOrderId(null);
    }
  };

  const formatFullAddress = (address) => {
    if (!address) return "Address not available";
    
    const parts = [
      address.name,
      address.address,
      address.city,
      address.state,
      address.pincode ? `${address.pincode}` : null,
      address.phone ? `Phone: ${address.phone}` : null
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
      display: "inline-block"
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

  if (loading) return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="loading-spinner loading-spinner-large"></div>
        <div className="page-loading-text">Loading orders...</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "auto" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1fr 2fr" : "1fr", gap: "2rem" }}>
          {/* Orders List */}
          <div>
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>Order History</h3>
            {orders.map(order => (
              <div
                key={order._id}
                className="order-card"
                style={{
                  border: selectedOrder?._id === order._id ? "2px solid #d4af37" : "1px solid #ddd",
                  padding: "1rem",
                  marginBottom: "1rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: selectedOrder?._id === order._id ? "#fff9e6" : "white",
                  transition: "all 0.3s ease"
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "600", color: "#333" }}>
                      Order ID: {order._id.slice(-8)}
                    </p>
                    <span style={getStatusBadgeStyle(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0", fontWeight: "600", color: "#d4af37" }}>
                      ₹{order.priceBreakup?.totalAmount?.toLocaleString('en-IN') || 0}
                    </p>
                    <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                      {new Date(order.createdAt).toDateString()}
                    </p>
                  </div>
                </div>
                
                <div style={{ fontSize: "12px", color: "#666", marginTop: "0.5rem" }}>
                  {formatFullAddress(order.shippingAddress)}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                  {order.orderStatus === "pending" && (
                    <button
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        backgroundColor: cancellingOrderId === order._id ? "#6b7280" : "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: cancellingOrderId === order._id ? "not-allowed" : "pointer",
                        opacity: cancellingOrderId === order._id ? 0.8 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOrder(order._id);
                      }}
                      disabled={cancellingOrderId === order._id}
                    >
                      {cancellingOrderId === order._id ? (
                        <>
                          <span className="loading-spinner loading-spinner-small"></span>
                          Cancelling...
                        </>
                      ) : (
                        'Cancel'
                      )}
                    </button>
                  )}
                  
                  {order.orderStatus?.toLowerCase() === "cancelled" && (
                    <button
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        backgroundColor: removingOrderId === order._id ? "#6b7280" : "#9e9e9e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: removingOrderId === order._id ? "not-allowed" : "pointer",
                        opacity: removingOrderId === order._id ? 0.8 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOrder(order._id);
                      }}
                      disabled={removingOrderId === order._id}
                    >
                      {removingOrderId === order._id ? (
                        <>
                          <span className="loading-spinner loading-spinner-small"></span>
                          Removing...
                        </>
                      ) : (
                        'Remove'
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div style={{ backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ margin: 0, color: "#333" }}>Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "none",
                    border: "1px solid #ddd",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Order ID</p>
                    <p style={{ margin: "0", fontWeight: "600" }}>{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Status</p>
                    <span style={getStatusBadgeStyle(selectedOrder.orderStatus)}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Payment Method</p>
                    <p style={{ margin: "0" }}>{selectedOrder.payment?.method || "N/A"} ({selectedOrder.paymentStatus})</p>
                  </div>
                  <div>
                    <p style={{ margin: "0 0 0.5rem 0", fontSize: "12px", color: "#666" }}>Order Date</p>
                    <p style={{ margin: "0" }}>{new Date(selectedOrder.createdAt).toDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              {selectedOrder.orderStatus && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <OrderTimeline status={selectedOrder.orderStatus} />
                </div>
              )}

              {/* Delivery Address */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>📍 Delivery Address</h4>
                <div style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "6px", lineHeight: "1.6" }}>
                  {formatFullAddress(selectedOrder.shippingAddress)}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
  <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>📦 Items</h4>

  {selectedOrder.items?.map((item, index) => {

    // 🔥 IMPORTANT: agar item.productId nahi ho to item.product use karo
    const productId = item.productId || item.product;

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
          alignItems: "center"
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

          {/* ⭐ REVIEW LOGIC */}
          {selectedOrder.orderStatus?.toLowerCase() === "delivered" && (
            hasReviewed ? (
              <span style={{ color: "green", fontSize: "13px" }}>
                ✔ Review Submitted
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
                  fontSize: "12px"
                }}
                onClick={() => openReviewModal(productId)}
              >
                Write Review
              </button>
            )
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <strong style={{ color: "#d4af37" }}>
            ₹{(item.price * item.qty).toLocaleString("en-IN")}
          </strong>
        </div>
      </div>
    );
  })}
</div>

              {/* Reviews Section */}
              {selectedOrder.orderStatus?.toLowerCase() === "delivered" && (
                <div style={{ marginTop: "2rem" }}>
                  <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>
                    📝 Reviews for this Order ({orderReviews.length})
                  </h4>
                  
                  {reviewsLoading ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                      <div className="loading-spinner loading-spinner-small"></div>
                      Loading reviews...
                    </div>
                  ) : orderReviews.length === 0 ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "2rem", 
                      color: "#666",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px"
                    }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⭐</div>
                      <p style={{ margin: "0", fontSize: "16px" }}>
                        No reviews yet for this order
                      </p>
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
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                                fontSize: "14px",
                                fontWeight: "500"
                              }}>
                                {review.userId?.name?.charAt(0)?.toUpperCase() || 'Y'}
                              </div>
                              <div>
                                <div style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}>
                                  You
                                </div>
                                <div style={{ fontSize: "12px", color: "#666" }}>
                                  {review.userId?.email || ''}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#ffc107", fontSize: "16px" }}>
                                  {'★'.repeat(review.rating)}
                                </span>
                                <span style={{ fontSize: "12px", color: "#666", marginLeft: "4px" }}>
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{
                            backgroundColor: "#f8f9fa",
                            padding: "12px",
                            borderRadius: "6px",
                            borderLeft: "3px solid #3b82f6",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            color: "#333"
                          }}>
                            {review.comment}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakup */}
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>💰 Price Details</h4>
                <div style={{ backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "6px", maxWidth: "400px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>Gold Value:</span>
                    <span>₹{(selectedOrder.priceBreakup?.goldValue || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>Making Charges:</span>
                    <span>₹{(selectedOrder.priceBreakup?.makingCharge || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>Stone Charges:</span>
                    <span>₹{(selectedOrder.priceBreakup?.stoneCharge || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>GST:</span>
                    <span>₹{(selectedOrder.priceBreakup?.gst || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <hr style={{ margin: "0.5rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "16px" }}>
                    <span>Total:</span>
                    <span style={{ color: "#d4af37" }}>
                      ₹{(selectedOrder.priceBreakup?.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => downloadInvoice(selectedOrder._id)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#d4af37",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  📄 Download Invoice
                </button>

                {selectedOrder.orderStatus === "pending" && (
                  <button
                    onClick={() => cancelOrder(selectedOrder._id)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && selectedProductForReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <ReviewForm
              productId={selectedProductForReview}
              orderId={selectedOrder._id}
              onReviewSubmitted={() => {
                // Update reviewed products list
                setReviewedProducts(prev => [...prev, selectedProductForReview]);
                closeReviewModal();
                alert('Review submitted successfully!');
              }}
              onCancel={closeReviewModal}
            />
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && selectedProductForReview && (
        <div className="page-loading-overlay">
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <ReviewForm
              productId={selectedProductForReview}
              orderId={selectedOrder._id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={closeReviewModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;  