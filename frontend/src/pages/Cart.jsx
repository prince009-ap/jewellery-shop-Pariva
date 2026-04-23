import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../context/useCart";
import QuantitySelector from "../components/common/QuantitySelector";
import API, { API_BASE_URL } from "../services/api";
import "./Cart.css";
import { getUserToken } from "../utils/authStorage";
import { useAuthPrompt } from "../context/AuthPromptContext";

const APPLIED_COUPON_STORAGE_KEY = "appliedCartCoupon";

function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeFromCart, totalItems, loading } = useCart();
  const { showAuthPrompt } = useAuthPrompt();
  const safeCart = cart.filter((item) => item.product);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponMessageType, setCouponMessageType] = useState("");
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 540 : false
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const railRef = useRef(null);

  const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

  const goldTotal = safeCart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const makingTotal = safeCart.reduce(
    (sum, item) =>
      sum + ((item.product.price * (item.product.makingChargePercent || 12)) / 100) * item.qty,
    0
  );
  const stoneTotal = safeCart.reduce(
    (sum, item) => sum + (item.product.stonePrice || 0) * item.qty,
    0
  );
  const subTotal = goldTotal + makingTotal + stoneTotal;
  const gst = subTotal * 0.03;
  const grandTotal = subTotal + gst;
  const finalAmount = Math.max(grandTotal - discount, 0);

  useEffect(() => {
    const savedCoupon = sessionStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
    if (!savedCoupon) return;

    try {
      const parsedCoupon = JSON.parse(savedCoupon);
      if (!parsedCoupon?.code || Number(parsedCoupon?.discount || 0) <= 0) {
        sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
        return;
      }

      setCoupon(parsedCoupon.code);
      setDiscount(Number(parsedCoupon.discount));
      setCouponMessage("Coupon applied successfully.");
      setCouponMessageType("success");
    } catch {
      sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!coupon.trim() || discount <= 0) return;

    sessionStorage.setItem(
      APPLIED_COUPON_STORAGE_KEY,
      JSON.stringify({
        code: coupon.trim(),
        discount,
      })
    );
  }, [coupon, discount]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 540);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const applyCoupon = async () => {
    if (couponLoading || !coupon.trim()) return;

    try {
      setCouponLoading(true);
      setCouponMessage("");
      setCouponMessageType("");
      const res = await API.post("/apply-coupon", {
        code: coupon,
        cartTotal: grandTotal,
      });
      setDiscount(res.data.discount);
      setCouponMessage("Coupon applied successfully.");
      setCouponMessageType("success");
      sessionStorage.setItem(
        APPLIED_COUPON_STORAGE_KEY,
        JSON.stringify({
          code: coupon.trim(),
          discount: Number(res.data.discount || 0),
        })
      );
    } catch (err) {
      setDiscount(0);
      setCouponMessage(err.response?.data?.message || "Invalid coupon");
      setCouponMessageType("error");
      sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
    } finally {
      setCouponLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (safeCart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-shell">
          <nav className="cart-breadcrumb">
            <Link to="/home">Home</Link>
            <span>&gt;</span>
            <span>Cart</span>
          </nav>

          <section className="cart-empty-card">
            <p className="cart-kicker">Personal Cart</p>
            <h1>Your Cart Is Empty</h1>
            <p>Add your favorite pieces and review the final price here before checkout.</p>
            <Link to="/home" className="cart-action-btn cart-home-link">
              Continue Shopping
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-shell">
        <nav className="cart-breadcrumb">
          <Link to="/home">Home</Link>
          <span>&gt;</span>
          <span>Cart</span>
        </nav>

        <header className="cart-header">
          <div className="cart-header-copy">
            <p className="cart-kicker">Order Review</p>
            <h1>Your Cart</h1>
            <p>Update quantity, apply offers, and check your payable amount before checkout.</p>
          </div>
          <div className="cart-header-stack">
            <div className="cart-meta">{totalItems} item(s)</div>
            <div className="cart-value-chip">
              <span>Payable</span>
              <strong>{formatPrice(finalAmount.toFixed(0))}</strong>
            </div>
          </div>
        </header>

        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-panel-head">
              <div>
                <p className="cart-panel-kicker">Selected Pieces</p>
                <h2>Cart Items</h2>
              </div>
              <span>{safeCart.length} design(s)</span>
            </div>

            <div
              className={isMobileView ? "cart-items-rail" : "cart-items-list"}
              ref={railRef}
              onScroll={() => {
                if (!isMobileView || !railRef.current) return;
                setActiveSlide(Math.round(railRef.current.scrollLeft / railRef.current.clientWidth));
              }}
            >
            {safeCart.map((item) => (
              <article className="cart-item-card" key={item.product._id}>
                <div className="cart-item-media">
                  <img
                    src={`${API_BASE_URL}/uploads/${item.product.image}`}
                    alt={item.product.name}
                  />
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-topline">
                    <div>
                      <h3>{item.product.name}</h3>
                      <p className="cart-item-category">
                        {item.product.category || "Jewellery"}
                        {" | "}
                        {item.product.metalType || item.product.metal || "Premium Finish"}
                      </p>
                    </div>
                    <div className="cart-line-total">
                      <span>Item Total</span>
                      <strong>{formatPrice(item.product.price * item.qty)}</strong>
                    </div>
                  </div>

                  <div className="cart-item-meta-grid">
                    <div className="cart-item-meta-box">
                      <span>Unit Price</span>
                      <strong>{formatPrice(item.product.price)}</strong>
                    </div>
                    <div className="cart-item-meta-box">
                      <span>Making</span>
                      <strong>{item.product.makingChargePercent || 12}%</strong>
                    </div>
                    <div className="cart-item-meta-box">
                      <span>Stone</span>
                      <strong>{formatPrice(item.product.stonePrice || 0)}</strong>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-wrap">
                      <QuantitySelector
                        value={item.qty}
                        onChange={(qty) => updateQty(item.product._id, qty)}
                      />
                    </div>

                    <button
                      type="button"
                      className="cart-action-btn ghost"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
            </div>

            {isMobileView && safeCart.length > 1 ? (
              <div className="cart-mobile-dots" aria-label="Cart items">
                {safeCart.map((_, index) => (
                  <button
                    key={`cart-dot-${index}`}
                    type="button"
                    className={`cart-mobile-dot ${activeSlide === index ? "active" : ""}`}
                    onClick={() => {
                      if (!railRef.current) return;
                      railRef.current.scrollTo({
                        left: railRef.current.clientWidth * index,
                        behavior: "smooth",
                      });
                    }}
                    aria-label={`Go to cart item ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </section>

          <aside className="cart-summary-panel">
            <section className="cart-coupon-card">
              <div className="cart-section-head">
                <h2>Apply Coupon</h2>
                <span>Offers</span>
              </div>

              <div className="cart-coupon-row">
                <input
                  className="cart-coupon-input"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  disabled={couponLoading}
                />

                <button
                  type="button"
                  className="cart-action-btn"
                  disabled={couponLoading}
                  onClick={applyCoupon}
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>

              {couponMessage ? (
                <div className={`cart-inline-message ${couponMessageType}`}>{couponMessage}</div>
              ) : null}
            </section>

            <section className="cart-bill-card">
              <div className="cart-section-head">
                <h2>Price Summary</h2>
                <span>Live total</span>
              </div>

              <div className="cart-bill-row">
                <span>Gold Value</span>
                <strong>{formatPrice(goldTotal)}</strong>
              </div>
              <div className="cart-bill-row">
                <span>Making Charges</span>
                <strong>{formatPrice(makingTotal)}</strong>
              </div>
              <div className="cart-bill-row">
                <span>Stone Charges</span>
                <strong>{formatPrice(stoneTotal)}</strong>
              </div>
              <div className="cart-bill-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subTotal)}</strong>
              </div>
              <div className="cart-bill-row">
                <span>GST (3%)</span>
                <strong>{formatPrice(gst.toFixed(0))}</strong>
              </div>
              {discount > 0 && (
                <div className="cart-bill-row discount">
                  <span>Coupon Discount</span>
                  <strong>- {formatPrice(discount)}</strong>
                </div>
              )}

              <div className="cart-total-row">
                <span>Payable Amount</span>
                <strong>{formatPrice(finalAmount.toFixed(0))}</strong>
              </div>

              <button
                type="button"
                className="cart-action-btn cart-checkout-btn"
                onClick={() => {
                  if (!getUserToken()) {
                    showAuthPrompt("Please sign in to continue with checkout.");
                    return;
                  }

                  navigate("/checkout", {
                    state: {
                      from: "/cart",
                      appliedCoupon: coupon.trim()
                        ? {
                            code: coupon.trim(),
                            discount,
                          }
                        : null,
                    },
                  });
                }}
              >
                Proceed to Checkout
              </button>
            </section>

            <section className="cart-note-card">
              <div className="cart-note-icon">01</div>
              <div>
                <h3>Secure Checkout Flow</h3>
                <p>Quantity and pricing stay in sync while you move from cart to checkout.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
