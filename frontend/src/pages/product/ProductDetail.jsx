import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import useCart from "../../context/useCart";
import QuantitySelector from "../../components/common/QuantitySelector";
import WishlistHeart from "../../components/wishlist/WishlistHeart";
import StarRating from "../../components/StarRating";
import ReviewForm from "../../components/ReviewForm";
import ReviewList from "../../components/ReviewList";
import styles from "./ProductDetail.module.css";
import { getUserToken } from "../../utils/authStorage";
import { useAuthPrompt } from "../../context/AuthPromptContext";

const getProductId = (item) => {
  const rawProduct = item?.productId || item?.product;
  if (!rawProduct) return null;
  if (typeof rawProduct === "string") return rawProduct;
  return rawProduct._id || rawProduct.id || null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart: addToCartContext, updateQty } = useCart();
  const { showAuthPrompt } = useAuthPrompt();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity] = useState(1);
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

  const checkReviewEligibility = useCallback(async () => {
    try {
      const token = getUserToken();
      if (!token) {
        setCanReview(false);
        return;
      }

      const ordersResponse = await API.get("/orders/my");
      const orders = ordersResponse.data || [];
      const hasDeliveredOrder = orders.some(
        (order) =>
          order.orderStatus === "delivered" &&
          order.items.some((item) => getProductId(item) === id)
      );

      setCanReview(hasDeliveredOrder);
      setUserOrders(orders);
    } catch (error) {
      console.error("Failed to check review eligibility:", error);
      setCanReview(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
    fetchReviews();
    checkReviewEligibility();
  }, [fetchProductDetail, fetchReviews, checkReviewEligibility]);

  const buyNow = () => {
    if (!product || product.stock === 0) return;
    if (!getUserToken()) {
      showAuthPrompt("Please sign in to continue to checkout.");
      return;
    }

    navigate("/checkout", {
      state: {
        source: "direct",
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            qty: selectedQty,
            image: product.image,
            makingChargePercent: product.makingChargePercent || 12,
            stonePrice: product.stonePrice || 0,
            metal: product.metal,
            occasion: product.occasion,
          },
        ],
      },
    });
  };

  const calculateTotalPrice = () => {
    if (!product || !product.price || !product.makingChargePercent) return 0;
    const makingCharge = product.price * (product.makingChargePercent / 100);
    return product.price + makingCharge + (product.stonePrice || 0);
  };

  const calculateGST = () => calculateTotalPrice() * 0.03;

  const getDeliveryEstimate = () => {
    // Fixed delivery estimate per request
    return "5-7 working days";
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setShowReviewForm(false);

    if (product) {
      const newTotalReviews = (product.totalReviews || 0) + 1;
      const newAverageRating =
        ((product.averageRating || 0) * (product.totalReviews || 0) + newReview.rating) /
        newTotalReviews;

      setProduct((prev) => ({
        ...prev,
        averageRating: Math.round(newAverageRating * 10) / 10,
        totalReviews: newTotalReviews,
      }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <div className={styles.loadingText}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div>Product not found</div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const gst = calculateGST();
  const finalPrice = totalPrice + gst;
  const cartItem = cart.find((item) => item.product && item.product._id === product._id);
  const cartQty = cartItem?.qty || 0;
  const selectedQty = cartQty || quantity;
  const reviewOrderId = userOrders.find(
    (order) =>
      order.orderStatus === "delivered" &&
      order.items.some((item) => getProductId(item) === id)
  )?._id;
  const galleryImages = product.images && product.images.length > 0 ? [product.image, ...product.images] : [product.image];

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/home" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span>/</span>
        <Link to={`/category/${product.category}`} className={styles.breadcrumbLink}>
          {product.category}
        </Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.mainGrid}>
        <div>
          <div className={styles.mainImageContainer}>
            <img
              src={`http://localhost:5000/uploads/${galleryImages[selectedImage]}`}
              alt={product.name}
              className={styles.mainImage}
              onError={(e) => {
                e.target.src = "/images/placeholder.jpg";
              }}
            />
          </div>

          {galleryImages.length > 1 ? (
            <div className={styles.thumbnailGallery}>
              {galleryImages.map((img, index) => (
                <img
                  key={img + index}
                  src={`http://localhost:5000/uploads/${img}`}
                  alt={`${product.name} ${index + 1}`}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.selected : ""}`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              ))}
            </div>
          ) : null}

          <div className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <div>
                <p className={styles.reviewsEyebrow}>Verified Impressions</p>
                <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
              </div>

              <div className={styles.ratingSummary}>
                <div className={styles.ratingSummaryScore}>
                  {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                </div>
                <div className={styles.ratingSummaryCount}>
                  {product.totalReviews || 0} {product.totalReviews === 1 ? "Review" : "Reviews"}
                </div>
              </div>

              {canReview ? (
                <button onClick={() => setShowReviewForm(true)} className={styles.writeReviewButton}>
                  Write a Review
                </button>
              ) : null}
            </div>

            {showReviewForm ? (
              <div className={styles.reviewFormOverlay}>
                <div className={styles.reviewFormModal}>
                  <ReviewForm
                    productId={id}
                    orderId={reviewOrderId}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              </div>
            ) : null}

            <ReviewList reviews={reviews} loading={reviewsLoading} />
          </div>
        </div>

        <div className={styles.detailColumn}>
          <div className={styles.heroBlock}>
            <div className={styles.titleRow}>
              <div>
                <p className={styles.eyebrow}>Handcrafted Detail</p>
                <h1 className={styles.productTitle}>{product.name}</h1>
              </div>
              <div className={styles.wishlistWrap}>
                <WishlistHeart product={product} />
              </div>
            </div>

            <div className={styles.badgesContainer}>
              {product.isNew ? <span className={`${styles.badge} ${styles.badgeNew}`}>New</span> : null}
              {product.isTrending ? (
                <span className={`${styles.badge} ${styles.badgeTrending}`}>Trending</span>
              ) : null}
              {product.isFeatured ? (
                <span className={`${styles.badge} ${styles.badgeFeatured}`}>Featured</span>
              ) : null}
            </div>

            <div className={styles.heroRatingRow}>
              <StarRating value={product.averageRating || 0} readonly={true} size="small" />
              <span className={styles.heroRatingText}>
                {product.totalReviews > 0
                  ? `${(product.averageRating || 0).toFixed(1)} rating from ${product.totalReviews} ${
                      product.totalReviews === 1 ? "review" : "reviews"
                    }`
                  : "No reviews yet"}
              </span>
            </div>

            <div className={styles.priceSection}>
              <div className={styles.mainPrice}>Rs {finalPrice.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div className={styles.detailsBox}>
            <h3 className={styles.detailsBoxTitle}>Product Details</h3>
            <div className={styles.detailsGrid}>
              <div>
                <p className={styles.detailLabel}>Category</p>
                <p className={styles.detailValue}>{product.category}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Metal</p>
                <p className={styles.detailValue}>{product.metal}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Purity</p>
                <p className={styles.detailValue}>{product.purity}</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Weight</p>
                <p className={styles.detailValue}>{product.weight}g</p>
              </div>
            </div>

            <div className={styles.ratingDisplay}>
              <div className={styles.ratingLabel}>Customer Rating</div>
              <div className={styles.ratingContent}>
                <StarRating value={product.averageRating || 0} readonly={true} size="medium" />
                <span className={styles.ratingScore}>
                  {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                </span>
                <span className={styles.ratingCount}>
                  ({product.totalReviews || 0} {product.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>

            {product.description ? (
              <div className={styles.descriptionSection}>
                <h3 className={styles.sectionTitle}>Description</h3>
                <p className={styles.descriptionText}>{product.description}</p>
              </div>
            ) : null}
          </div>

          <div className={styles.priceBreakdown}>
            <h3 className={styles.breakdownTitle}>Price Breakdown</h3>
            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownRow}>
                <span>Base Price</span>
                <span>Rs {product.price.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Making Charge ({product.makingChargePercent}%)</span>
                <span>Rs {(product.price * product.makingChargePercent / 100).toLocaleString("en-IN")}</span>
              </div>
              {product.stonePrice > 0 ? (
                <div className={styles.breakdownRow}>
                  <span>Stone Price</span>
                  <span>Rs {product.stonePrice.toLocaleString("en-IN")}</span>
                </div>
              ) : null}
              <div className={styles.breakdownRow}>
                <span>GST (3%)</span>
                <span>Rs {gst.toLocaleString("en-IN")}</span>
              </div>
              <div className={styles.breakdownTotal}>
                <span>Total</span>
                <span className={styles.totalPrice}>Rs {finalPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionsContainer}>
            {cartQty > 0 ? (
              <div className={styles.inlineCounterWrap}>
                <QuantitySelector value={cartQty} onChange={(newQty) => updateQty(product._id, newQty)} />
              </div>
            ) : (
              <button
                type="button"
                className={styles.actionSecondaryButton}
                onClick={() => {
                  void addToCartContext(id, selectedQty);
                }}
                disabled={product.stock === 0}
              >
                Add To Cart
              </button>
            )}
            <button
              onClick={buyNow}
              disabled={product.stock === 0}
              className={styles.buyNowButton}
            >
              Buy Now
            </button>
          </div>

          <div className={styles.deliveryBox}>
            <div className={styles.deliveryContent}>
              <strong>Delivery:</strong> {getDeliveryEstimate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
