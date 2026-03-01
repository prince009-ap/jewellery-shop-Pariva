// src/pages/cart/Cart.jsx
import React from "react";
import  useCart  from "../context/useCart";
import QuantitySelector from "../components/common/QuantitySelector";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useState } from "react";

function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    updateQty,
    removeFromCart,
    totalItems,
    loading,
  } = useCart();
// 🔐 remove invalid cart items (product deleted / null)
const safeCart = cart.filter(item => item.product);



const [coupon, setCoupon] = useState("");
const [discount, setDiscount] = useState(0);
const [couponLoading, setCouponLoading] = useState(false);
const applyCoupon = async () => {
  if (couponLoading) return;
  
  try {
    setCouponLoading(true);
    const res = await API.post("/apply-coupon", {
      code: coupon,
      cartTotal: grandTotal,
    });

    setDiscount(res.data.discount);
    alert("Coupon applied successfully");
  } catch (err) {
    alert(err.response?.data?.message || "Invalid coupon");
    setDiscount(0);
  } finally {
    setCouponLoading(false);
  }
};

  if (loading) return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="loading-spinner loading-spinner-large"></div>
        <div className="page-loading-text">Loading cart...</div>
      </div>
    </div>
  );

if (safeCart.length === 0)
  return <h2 style={{ padding: 40 }}>Your cart is empty 🛒</h2>;


  const goldTotal = safeCart.reduce(
  (sum, i) => sum + i.product.price * i.qty,
  0
);


const makingTotal = safeCart.reduce(
  (sum, i) =>
    sum +
    (i.product.price *
      (i.product.makingChargePercent || 12)) /
      100 *
      i.qty,
  0
);

const stoneTotal = safeCart.reduce(
  (sum, i) => sum + (i.product.stonePrice || 0) * i.qty,
  0
);


const subTotal = goldTotal + makingTotal + stoneTotal;
const gst = subTotal * 0.03;
const grandTotal = subTotal + gst;
const finalAmount = grandTotal - discount;


 return (
  <div className="cart-page">
    <h2>Your Cart ({totalItems} items)</h2>

    {/* ===== CART ITEMS ===== */}
    {safeCart.map((item) => (
      <div className="cart-item" key={item.product._id}>
        <img
          src={`http://localhost:5000/uploads/${item.product.image}`}
          alt={item.product.name}
        />

        <div className="cart-info">
          <h3>{item.product.name}</h3>
          <p className="price">₹{item.product.price}</p>

          <QuantitySelector
            value={item.qty}
            onChange={(qty) => updateQty(item.product._id, qty)}
          />

          <button
            className="remove-btn"
            onClick={() => removeFromCart(item.product._id)}
          >
            Remove
          </button>
        </div>
      </div>
    ))}
<div style={{ marginTop: 20 }}>
  <input
    placeholder="Enter coupon code"
    value={coupon}
    onChange={(e) => setCoupon(e.target.value)}
    disabled={couponLoading}
  />
  <button 
    onClick={applyCoupon}
    disabled={couponLoading}
    className={couponLoading ? 'button-loading' : ''}
    style={{ 
      opacity: couponLoading ? 0.7 : 1,
      cursor: couponLoading ? 'not-allowed' : 'pointer'
    }}
  >
    {couponLoading ? (
      <span className="button-loading-content">
        <span className="loading-spinner-small"></span>
        Applying...
      </span>
    ) : (
      'Apply'
    )}
  </button>
</div>

{discount > 0 && (
  <div className="bill-row">
    <span>Coupon Discount</span>
    <span>- ₹{discount}</span>
  </div>
)}

    {/* ===== BILL DETAILS ===== */}
    <div className="bill-details">
      <h3>Bill details</h3>

      <div className="bill-row">
        <span>Gold value</span>
        <span>₹{goldTotal}</span>
      </div>

      <div className="bill-row">
        <span>Making charges</span>
        <span>₹{makingTotal}</span>
      </div>

      <div className="bill-row">
        <span>Stone charges</span>
        <span>₹{stoneTotal}</span>
      </div>

      <hr />

      <div className="bill-row">
        <span>Subtotal</span>
        <span>₹{subTotal}</span>
      </div>

      <div className="bill-row">
        <span>GST (3%)</span>
        <span>₹{gst.toFixed(0)}</span>
      </div>

      <hr />

      <div className="bill-row grand-total">
  <strong>Payable Amount</strong>
  <strong>₹{finalAmount.toFixed(0)}</strong>
</div>

    </div>

    {/* ===== CHECKOUT ===== */}
    <div className="cart-summary">
      <button
  className="checkout-btn"
  onClick={() => navigate("/checkout")}
>
 Proceed to Checkout • ₹{finalAmount.toFixed(0)}

</button>
    </div>
  </div>
);

}

export default Cart;
