import { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import useCart from "../../context/useCart";
import QuantityCounter from "../../components/common/QuantityCounter";
import WorkingWishlistHeart from "../../components/wishlist/WorkingWishlistHeart";
import { Link } from "react-router-dom";
import WishlistHeart from "../../components/wishlist/WishlistHeart";
import StarRating from "../../components/StarRating";
import ReviewForm from "../../components/ReviewForm";
import ReviewList from "../../components/ReviewList";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [canReview, setCanReview] = useState(false);
  
  const fetchProductDetail = useCallback(async () => {
  try {
    setLoading(true);
    const res = await API.get(`/products/${id}`);
    setProduct(res.data);
  } catch (error) {
    console.error("Failed to fetch product:", error);
  } finally {
    setLoading(false);
  }
}, [id]);

  // Fetch reviews for this product
  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await API.get(`/reviews/product/${id}`);
      if (response.data.success) {
        setReviews(response.data.data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // Check if user can review this product
  const checkReviewEligibility = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCanReview(false);
        return;
      }

      const ordersResponse = await API.get('/orders/my-orders');
      const orders = ordersResponse.data || [];
      
      // Check if user has a delivered order with this product
      const hasDeliveredOrder = orders.some(order => 
        order.orderStatus === 'delivered' && 
        order.items.some(item => item.product === id)
      );

      setCanReview(hasDeliveredOrder);
      setUserOrders(orders);
    } catch (error) {
      console.error("Failed to check review eligibility:", error);
      setCanReview(false);
    }
  }, [id]);

  // Fetch product details, reviews, and check eligibility
  useEffect(() => {
    fetchProductDetail();
    fetchReviews();
    checkReviewEligibility();
  }, [fetchProductDetail, fetchReviews, checkReviewEligibility]);

  const buyNow = () => {
    if (product.stock === 0) return;
    navigate("/checkout", { state: { productId: id, quantity } });
  };

  const calculateTotalPrice = () => {
    if (!product || !product.price || !product.makingChargePercent) return 0;
    const makingCharge = product.price * (product.makingChargePercent / 100);
    const total = product.price + makingCharge + (product.stonePrice || 0);
    return total;
  };

  // Handle review submission
  const handleReviewSubmitted = (newReview) => {
    // Add new review to the list
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setShowReviewForm(false);
    
    // Update product rating in UI
    if (product) {
      const newTotalReviews = (product.totalReviews || 0) + 1;
      const newAverageRating = ((product.averageRating || 0) * (product.totalReviews || 0) + newReview.rating) / newTotalReviews;
      setProduct(prev => ({
        ...prev,
        averageRating: Math.round(newAverageRating * 10) / 10,
        totalReviews: newTotalReviews
      }));
    }
  };

  const calculateGST = () => {
    return calculateTotalPrice() * 0.03; // 3% GST
  };

  const getDeliveryEstimate = () => {
    if (product.availability === "made_to_order") {
      return "15-20 working days";
    } else if (product.stock > 0) {
      return "3-5 working days";
    } else {
      return "7-10 working days";
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "4rem", 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #d4af37",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }} />
        <div style={{ color: "#6b7280", fontSize: "1rem" }}>Loading product details...</div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Product not found</div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const gst = calculateGST();
  const finalPrice = totalPrice + gst;

  return (
    <div style={{ padding: "0", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ padding: "1rem 2rem", fontSize: "0.875rem", color: "#6b7280" }}>
       <div style={{ padding: "1rem 2rem", fontSize: "0.875rem", color: "#6b7280" }}>
  <Link to="/home" style={{ textDecoration: "none", color: "#6b7280" }}>
    Home
  </Link>

  {" → "}

  <Link 
    to={`/category/${product.category}`} 
    style={{ textDecoration: "none", color: "#6b7280" }}
  >
    {product.category}
  </Link>

  {" → "}

  <span style={{ color: "#d4af37", fontWeight: "500" }}>
    {product.name}
  </span>
</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", padding: "2rem" }}>
        {/* Left Side - Images */}
        <div>
          {/* Main Image */}
          <div style={{
            background: "#f9fafb",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "1rem",
            aspectRatio: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              src={`http://localhost:5000/uploads/${(product.images && product.images[selectedImage]) || product.image}`}
              alt={product.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "8px"
              }}
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
              {[product.image, ...product.images].map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/uploads/${img}`}
                  alt={`${product.name} ${index + 1}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: selectedImage === index ? "2px solid #d4af37" : "1px solid #e5e7eb",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              ))}
            </div>
          )}
        </div>
            
        {/* Right Side - Product Details */}
        <div>
          {/* Product Title */}
          <h1 style={{ fontSize: "2rem", margin: "0 0 1rem 0", color: "#111827" }}>
            {product.name}
          </h1>

          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {product.isNew && (
              <span style={{
                background: "#10b981",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                NEW
              </span>
            )}
            {product.isTrending && (
              <span style={{
                background: "#f59e0b",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                TRENDING
              </span>
            )}
            {product.isFeatured && (
              <span style={{
                background: "#d4af37",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                FEATURED
              </span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: "2rem", color: "#d4af37", fontWeight: "600", marginBottom: "0.5rem" }}>
              ₹{finalPrice.toLocaleString()}
            </div>
            <div style={{ fontSize: "1rem", color: "#6b7280", textDecoration: "line-through" }}>
              ₹{product.price.toLocaleString()}
            </div>
          </div>

          {/* Product Details */}
          <div style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "1.5rem"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111827", fontSize: "1.25rem", fontWeight: "600" }}>
              Product Details
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <p style={{ margin: "0.5rem 0", color: "#374151", fontWeight: "500" }}>
                  Category
                </p>
                <p style={{ color: "#111827" }}>{product.category}</p>
              </div>
              <div>
                <p style={{ margin: "0.5rem 0", color: "#374151", fontWeight: "500" }}>
                  Metal
                </p>
                <p style={{ color: "#111827" }}>{product.metal}</p>
              </div>
              <div>
                <p style={{ margin: "0.5rem 0", color: "#374151", fontWeight: "500" }}>
                  Purity
                </p>
                <p style={{ color: "#111827" }}>{product.purity}</p>
              </div>
              <div>
                <p style={{ margin: "0.5rem 0", color: "#374151", fontWeight: "500" }}>
                  Weight
                </p>
                <p style={{ color: "#111827" }}>{product.weight}g</p>
              </div>
            </div>
            
            {/* Rating Display */}
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#fff', 
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                Customer Rating
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <StarRating value={product.averageRating || 0} readonly={true} size="medium" />
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#333' }}>
                  {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#666', marginLeft: '0.5rem' }}>
                  ({product.totalReviews || 0} {product.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#111827" }}>Description</h3>
                <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
          

          {/* Price Breakdown */}
          <div style={{
            background: "#f9fafb",
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "#111827" }}>Price Breakdown</h3>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Base Price:</span>
                <span>₹{product.price.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Making Charge ({product.makingChargePercent}%):</span>
                <span>₹{(product.price * product.makingChargePercent / 100).toLocaleString()}</span>
              </div>
              {product.stonePrice > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Stone Price:</span>
                  <span>₹{product.stonePrice.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>GST (3%):</span>
                <span>₹{gst.toLocaleString()}</span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "0.5rem",
                marginTop: "0.5rem",
                fontWeight: "600"
              }}>
                <span>Total:</span>
                <span style={{ color: "#d4af37" }}>₹{finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#374151", fontWeight: "500" }}>
              Quantity:
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1.25rem"
                }}
              >
                -
              </button>
              <span style={{ fontSize: "1.125rem", fontWeight: "500", minWidth: "40px", textAlign: "center" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  borderRadius: "6px",
                  cursor: quantity >= product.stock ? "not-allowed" : "pointer",
                  fontSize: "1.25rem",
                  opacity: quantity >= product.stock ? 0.5 : 1
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Delivery Estimate */}
          <div style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#065f46" }}>
              🚚 <strong>Delivery:</strong> {getDeliveryEstimate()}
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <QuantityCounter
              productId={id}
              initialQuantity={0}
              onQuantityChange={(productId, quantity) => {
                if (quantity === 0) {
                  // Remove from cart if quantity is 0
                  // This is handled by cart context
                } else {
                  // Add to cart with specified quantity
                  for (let i = 0; i < quantity; i++) {
                    addToCartContext(productId, 1);
                  }
                }
              }}
              disabled={product.stock === 0}
            />
            <button
              onClick={buyNow}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: "1rem",
                border: "1px solid #d4af37",
                background: "white",
                color: "#d4af37",
                borderRadius: "8px",
                cursor: product.stock > 0 ? "pointer" : "not-allowed",
                fontSize: "1rem",
                fontWeight: "500",
                opacity: product.stock === 0 ? 0.7 : 1
              }}
            >
              Buy Now
            </button>
          </div>

          {/* Wishlist Button */}
          <div style={{ marginTop: "1rem" }}>
            <WishlistHeart product={product} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ padding: "2rem 0" }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#333', 
            fontSize: '1.5rem',
            fontWeight: '600' 
          }}>
            Customer Reviews
          </h2>
          
          {/* Rating Summary */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <StarRating value={product.averageRating || 0} readonly={true} size="large" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '600', color: '#333' }}>
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
            </div>
            <div style={{ fontSize: '1rem', color: '#666' }}>
              {product.totalReviews || 0} {product.totalReviews === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
          
          {/* Write Review Button */}
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#007bff';
              }}
            >
              ✍️ Write a Review
            </button>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
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
                productId={id}
                orderId={userOrders.find(order => 
                  order.orderStatus === 'delivered' && 
                  order.items.some(item => item.product === id)
                )?._id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          </div>
        )}

        {/* Reviews List */}
        <ReviewList reviews={reviews} loading={reviewsLoading} />
      </div>

      {/* Similar Products Section */}
      <div style={{ padding: "2rem" }}>
        <h2 style={{ margin: "0 0 2rem 0", color: "#111827" }}>Similar Products</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1.5rem"
        }}>
          {/* This would be populated with similar products */}
          <div style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
            Similar products will be shown here
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
