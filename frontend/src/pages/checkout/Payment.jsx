import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import API, { API_BASE_URL } from "../../services/api";
import "../../styles/loading.css";

const APPLIED_COUPON_STORAGE_KEY = "appliedCartCoupon";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addressId, priceBreakup, items } = location.state || {};

  const [codLoading, setCodLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");

  const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

  if (!addressId || !priceBreakup || !items || items.length === 0) {
    return (
      <div className="checkout-flow-page">
        <div className="checkout-flow-shell">
          <nav className="checkout-flow-breadcrumb">
            <Link to="/home">Home</Link>
            <span>&gt;</span>
            <span>Payment</span>
          </nav>
          <div className="checkout-empty-state">No items available for payment.</div>
        </div>
      </div>
    );
  }

  const showMessage = (message, type = "success") => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const clearAppliedCoupon = () => {
    sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
  };

  const placeCodOrder = async () => {
    if (codLoading) return;

    try {
      setCodLoading(true);
      showMessage("");

      await API.post("/orders/cod", {
        items,
        shippingAddress: addressId,
        priceBreakup: {
          goldValue: priceBreakup.gold,
          makingCharge: priceBreakup.making,
          stoneCharge: priceBreakup.stone,
          gst: priceBreakup.gst,
          totalAmount: priceBreakup.total,
        },
      });

      clearAppliedCoupon();
      showMessage("Order placed successfully with Cash on Delivery.", "success");
      window.setTimeout(() => navigate("/account/orders"), 1200);
    } catch (err) {
      console.error(err.response?.data || err);
      showMessage(err.response?.data?.message || "Order failed. Please try again.", "error");
    } finally {
      setCodLoading(false);
    }
  };

  const payOnline = async () => {
    if (onlineLoading) return;

    try {
      setOnlineLoading(true);
      showMessage("");

      const { data: rzOrder } = await API.post("/payment/create-order", {
        amount: priceBreakup.total,
      });

      const order = rzOrder.order;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "PARIVA Jewellery",
        description: "Jewellery Purchase",
        image: "/logo.png",
        prefill: {
          name: "Customer",
          email: "customer@email.com",
          contact: "9999999999",
        },
        theme: {
          color: "#d4af37",
        },
        modal: {
          ondismiss: () => {
            setOnlineLoading(false);
            showMessage("Payment window closed before completion.", "error");
          },
        },
        handler: async (response) => {
          try {
            const { data } = await API.post("/payment/verify", {
              ...response,
              orderData: {
                shippingAddress: addressId,
                items,
                priceBreakup: {
                  goldValue: priceBreakup.gold,
                  makingCharge: priceBreakup.making,
                  stoneCharge: priceBreakup.stone,
                  gst: priceBreakup.gst,
                  totalAmount: priceBreakup.total,
                },
              },
            });

            if (data.success) {
              clearAppliedCoupon();
              showMessage("Payment successful. Your order has been placed.", "success");
              window.setTimeout(() => navigate("/account/orders"), 1200);
            } else {
              showMessage(data.message || "Payment verification failed.", "error");
            }
          } catch (err) {
            console.error("Verification error:", err.response?.data || err);
            showMessage(
              err.response?.data?.message || "Payment verification failed. Please try again.",
              "error"
            );
          } finally {
            setOnlineLoading(false);
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay checkout library is not loaded");
      }

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        setOnlineLoading(false);
        showMessage(response.error?.description || "Online payment failed.", "error");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setOnlineLoading(false);

      // If Razorpay script wasn't loaded, show a clear message
      if (err.message?.includes("Razorpay")) {
        showMessage(
          "Payment gateway is not available right now. Please try again later.",
          "error"
        );
        return;
      }

      const backendMessage = err.response?.data?.message || err.message;
      showMessage(
        backendMessage || "Unable to start online payment right now.",
        "error"
      );
    }
  };

  return (
    <div className="checkout-flow-page">
      <div className="checkout-flow-shell">
        <nav className="checkout-flow-breadcrumb">
          <Link to="/home">Home</Link>
          <span>&gt;</span>
          <Link to="/checkout">Checkout</Link>
          <span>&gt;</span>
          <span>Payment</span>
        </nav>

        <header className="checkout-flow-header">
          <div>
            <p className="checkout-flow-kicker">Secure Payment</p>
            <h1>Choose how you want to pay</h1>
            <p>Review your total once and complete the order with your preferred method.</p>
          </div>
        </header>

        <div className="payment-flow-layout">
          <section className="payment-summary-card">
            <div className="checkout-section-head">
              <div>
                <p className="checkout-section-kicker">Summary</p>
                <h2>Price Details</h2>
              </div>
              <span>{items.length} item(s)</span>
            </div>

            <div className="checkout-summary-list">
              {items.map((item) => (
                <div key={`${item.product}-${item.qty}`} className="checkout-summary-item">
                  <img
                    src={`${API_BASE_URL}/uploads/${item.image}`}
                    alt={item.name}
                    className="checkout-summary-item__image"
                  />
                  <div className="checkout-summary-item__copy">
                    <strong>{item.name}</strong>
                    <span>Qty {item.qty}</span>
                  </div>
                  <div className="checkout-summary-item__price">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-bill">
              <div className="checkout-bill-row">
                <span>Gold Value</span>
                <strong>{formatPrice(priceBreakup.gold)}</strong>
              </div>
              <div className="checkout-bill-row">
                <span>Making Charges</span>
                <strong>{formatPrice(priceBreakup.making.toFixed(0))}</strong>
              </div>
              <div className="checkout-bill-row">
                <span>Stone Charges</span>
                <strong>{formatPrice(priceBreakup.stone)}</strong>
              </div>
              <div className="checkout-bill-row">
                <span>GST (3%)</span>
                <strong>{formatPrice(priceBreakup.gst.toFixed(0))}</strong>
              </div>
              {Number(priceBreakup.couponDiscount || 0) > 0 ? (
                <div className="checkout-bill-row">
                  <span>
                    Coupon Discount
                    {priceBreakup.couponCode ? ` (${priceBreakup.couponCode})` : ""}
                  </span>
                  <strong>- {formatPrice(Number(priceBreakup.couponDiscount).toFixed(0))}</strong>
                </div>
              ) : null}
              <div className="checkout-bill-total">
                <span>Total</span>
                <strong>{formatPrice(priceBreakup.total.toFixed(0))}</strong>
              </div>
            </div>
          </section>

          <aside className="payment-method-card">
            <div className="checkout-section-head">
              <div>
                <p className="checkout-section-kicker">Methods</p>
                <h2>Payment Options</h2>
              </div>
            </div>

            <div className="payment-method-hero">
              <div>
                <p className="payment-method-eyebrow">Fast checkout on every screen</p>
                <h3>Pay with GPay, UPI ID, cards, and more</h3>
                <p>
                  Tap the online payment button and Razorpay will open secure options for
                  Google Pay, UPI apps, direct UPI ID entry, and cards.
                </p>
              </div>
              <div className="payment-method-badges" aria-label="Accepted payment modes">
                <span>GPay</span>
                <span>UPI ID</span>
                <span>PhonePe</span>
                <span>Cards</span>
              </div>
            </div>

            {statusMessage ? (
              <div className={`checkout-inline-message ${statusType}`}>{statusMessage}</div>
            ) : null}

            <div className="payment-method-info-grid">
              <div className="payment-method-info-card">
                <p className="payment-method-info-card__label">Online Payment</p>
                <strong>Best for laptop checkout</strong>
                <p>
                  Open the secure payment window and choose your preferred app or type your
                  UPI ID directly there.
                </p>
              </div>
              <div className="payment-method-info-card">
                <p className="payment-method-info-card__label">Cash on Delivery</p>
                <strong>Simple offline payment</strong>
                <p>
                  Place the order instantly and pay when your jewellery arrives at your
                  doorstep.
                </p>
              </div>
            </div>

            <div className="payment-method-steps">
              <div className="payment-method-step">
                <span>1</span>
                <p>Click <strong>Pay Online</strong> on your laptop.</p>
              </div>
              <div className="payment-method-step">
                <span>2</span>
                <p>Select GPay, any UPI app, or enter your UPI ID in the popup.</p>
              </div>
              <div className="payment-method-step">
                <span>3</span>
                <p>Complete the payment and your order gets confirmed.</p>
              </div>
            </div>

            <button
              type="button"
              className="payment-method-btn"
              onClick={placeCodOrder}
              disabled={codLoading || onlineLoading}
            >
              {codLoading ? "Placing COD Order..." : "Cash on Delivery"}
            </button>

            <button
              type="button"
              className="payment-method-btn payment-method-btn--alt"
              onClick={payOnline}
              disabled={onlineLoading || codLoading}
            >
              {onlineLoading ? "Opening Payment..." : "Pay Online (UPI / Card)"}
            </button>

            <p className="payment-method-note">
              Secure checkout powered by Razorpay. UPI, GPay, cards, and supported wallet
              options appear in the payment window.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
