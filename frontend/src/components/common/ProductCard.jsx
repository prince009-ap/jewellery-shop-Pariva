import React from "react";
import { Link } from "react-router-dom";
import  useCart  from "../../context/useCart";
import QuantitySelector from "./QuantitySelector";
import WishlistHeart from "../wishlist/WishlistHeart";



import WishlistDropdown from "../wishlist/WishlistDropdown"; // 🔧 FIX



function ProductCard({ product }) {
  const { cart, addToCart, updateQty } = useCart();

// const isInWishlist = wishlists.some(wl =>
//   wl.products?.some(p => p._id === product._id)
// );

if (!product?._id) return null;


  if (!product) return null;

  // 🔍 check if product already in cart
  const cartItem = cart.find(
  (item) => item.product && item.product._id === product._id
);


  const qty = cartItem?.qty || 0;

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image-wrapper">
        <img
          src={`http://localhost:5000/uploads/${product.image}`}
          alt={product.name}
        />
      </Link>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.metal} • {product.occasion}</p>

        <div className="product-footer">
          <div className="product-price">
            ₹{product.price.toLocaleString("en-IN")}
          </div>
   {/* <button
  className="wishlist-heart"
  onClick={(e) => {
    e.stopPropagation();
  }}
>
  {isInWishlist ? "❤️" : "🤍"}
</button> */}
<WishlistHeart product={product} />




          {/* 🔥 MAIN MAGIC */}
          {qty === 0 ? (
            <button
              className="pill-button pill-small"
              onClick={() => {console.log("ADD TO CART CLICKED", product._id);addToCart(product._id, 1)}}
            >
              Add to Cart
            </button>
          ) : (
            <QuantitySelector
              value={qty}
              onChange={(newQty) =>
                updateQty(product._id, newQty)
              }
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
