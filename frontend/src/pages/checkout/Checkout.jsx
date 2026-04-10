import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import useCart from "../../context/useCart";

const APPLIED_COUPON_STORAGE_KEY = "appliedCartCoupon";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const directProductId = location.state?.productId;
  const directQuantity = location.state?.quantity || 1;
  const stateItems = location.state?.items || [];
  const source = location.state?.source || "cart";
  const appliedCoupon = useMemo(() => {
    if (location.state?.appliedCoupon) {
      return location.state.appliedCoupon;
    }

    const savedCoupon = sessionStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
    if (!savedCoupon) return null;

    try {
      const parsedCoupon = JSON.parse(savedCoupon);
      if (!parsedCoupon?.code || Number(parsedCoupon?.discount || 0) <= 0) {
        sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
        return null;
      }

      return {
        code: parsedCoupon.code,
        discount: Number(parsedCoupon.discount),
      };
    } catch {
      sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      return null;
    }
  }, [location.state]);

  const checkoutItems = useMemo(() => {
    if (stateItems.length > 0) {
      return stateItems;
    }

    if (directProductId) {
      const directCartItem = cart.find((item) => item.product?._id === directProductId);

      if (directCartItem?.product) {
        return [
          {
            product: directCartItem.product._id,
            name: directCartItem.product.name,
            price: directCartItem.product.price,
            qty: directQuantity,
            image: directCartItem.product.image,
            makingChargePercent: directCartItem.product.makingChargePercent || 12,
            stonePrice: directCartItem.product.stonePrice || 0,
            metal: directCartItem.product.metal,
            occasion: directCartItem.product.occasion,
          },
        ];
      }
    }

    return cart
      .filter((item) => item.product)
      .map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        image: item.product.image,
        makingChargePercent: item.product.makingChargePercent || 12,
        stonePrice: item.product.stonePrice || 0,
        metal: item.product.metal,
        occasion: item.product.occasion,
      }));
  }, [cart, directProductId, directQuantity, stateItems]);

  useEffect(() => {
    API.get("/address")
      .then((res) => {
        setAddresses(res.data);
        const def = res.data.find((address) => address.isDefault);
        if (def) {
          setSelectedAddress(def._id);
        }
      })
      .catch(() => {
        setMessage("Unable to load saved addresses right now. Please try again.");
        setMessageType("error");
      });
  }, []);

  const priceBreakup = useMemo(() => {
    const gold = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const making = checkoutItems.reduce(
      (sum, item) => sum + ((item.price * (item.makingChargePercent || 12)) / 100) * item.qty,
      0
    );
    const stone = checkoutItems.reduce((sum, item) => sum + (item.stonePrice || 0) * item.qty, 0);
    const subtotal = gold + making + stone;
    const gst = subtotal * 0.03;
    const preDiscountTotal = subtotal + gst;
    const couponDiscount = Math.min(Number(appliedCoupon?.discount || 0), preDiscountTotal);
    const total = Math.max(preDiscountTotal - couponDiscount, 0);

    return {
      gold,
      making,
      stone,
      gst,
      subtotal,
      couponCode: appliedCoupon?.code || "",
      couponDiscount,
      total,
    };
  }, [checkoutItems, appliedCoupon]);

  const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

  const proceedToPayment = () => {
    if (!selectedAddress) {
      setMessage("Please select a delivery address before continuing.");
      setMessageType("error");
      return;
    }

    setMessage("");
    navigate("/checkout/payment", {
      state: {
        addressId: selectedAddress,
        items: checkoutItems.map((item) => ({
          product: item.product,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
        })),
        priceBreakup,
      },
    });
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="checkout-flow-page">
        <div className="checkout-flow-shell">
          <nav className="checkout-flow-breadcrumb">
            <Link to="/home">Home</Link>
            <span>&gt;</span>
            <span>Checkout</span>
          </nav>

          <div className="checkout-empty-state">No items available for checkout.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-flow-page">
      <div className="checkout-flow-shell">
        <nav className="checkout-flow-breadcrumb">
          <Link to="/home">Home</Link>
          <span>&gt;</span>
          {source === "direct" ? null : <Link to="/cart">Cart</Link>}
          {source === "direct" ? null : <span>&gt;</span>}
          <span>Checkout</span>
        </nav>

        <header className="checkout-flow-header">
          <div>
            <p className="checkout-flow-kicker">Secure Checkout</p>
            <h1>Review delivery and order summary</h1>
            <p>Select address first, then continue to payment.</p>
          </div>
        </header>

        <div className="checkout-flow-layout">
          <section className="checkout-address-panel">
            <div className="checkout-section-head">
              <div>
                <p className="checkout-section-kicker">Step 1</p>
                <h2>Delivery Address</h2>
              </div>
              <span>{addresses.length} saved</span>
            </div>

            {message ? <div className={`checkout-inline-message ${messageType}`}>{message}</div> : null}

            <div className="checkout-address-list">
              {addresses.map((addr) => (
                <button
                  key={addr._id}
                  type="button"
                  className={`checkout-address-card ${selectedAddress === addr._id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedAddress(addr._id);
                    setMessage("");
                  }}
                >
                  <div className="checkout-address-card__top">
                    <strong>{addr.label}</strong>
                    {selectedAddress === addr._id ? <span>Selected</span> : null}
                  </div>
                  <p>{addr.house}, {addr.area}</p>
                  <p>{addr.city} - {addr.pincode}</p>
                  <p>{addr.state}</p>
                  <p>{addr.name}</p>
                  <p>{addr.phone}</p>
                </button>
              ))}
            </div>

            {addresses.length === 0 ? (
              <div className="checkout-inline-message error">
                No saved address found. Please add an address to continue.
              </div>
            ) : null}

            <button
              type="button"
              className="checkout-outline-btn"
              onClick={() => navigate("/account/addresses")}
            >
              Add New Address
            </button>
          </section>

          <aside className="checkout-summary-panel">
            <div className="checkout-section-head">
              <div>
                <p className="checkout-section-kicker">Step 2</p>
                <h2>Order Summary</h2>
              </div>
              <span>{checkoutItems.length} item(s)</span>
            </div>

            <div className="checkout-summary-list">
              {checkoutItems.map((item) => (
                <div key={`${item.product}-${item.qty}`} className="checkout-summary-item">
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                    className="checkout-summary-item__image"
                  />
                  <div className="checkout-summary-item__copy">
                    <strong>{item.name}</strong>
                    <span>{item.metal || "Jewellery"} • Qty {item.qty}</span>
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
              {priceBreakup.couponDiscount > 0 ? (
                <div className="checkout-bill-row">
                  <span>
                    Coupon Discount
                    {priceBreakup.couponCode ? ` (${priceBreakup.couponCode})` : ""}
                  </span>
                  <strong>- {formatPrice(priceBreakup.couponDiscount.toFixed(0))}</strong>
                </div>
              ) : null}
              <div className="checkout-bill-total">
                <span>Total</span>
                <strong>{formatPrice(priceBreakup.total.toFixed(0))}</strong>
              </div>
            </div>

            <button type="button" className="checkout-primary-btn" onClick={proceedToPayment}>
              Continue to Payment
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
