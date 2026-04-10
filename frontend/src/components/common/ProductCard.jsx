import { Link, useNavigate } from "react-router-dom";
import useCart from "../../context/useCart";
import QuantitySelector from "./QuantitySelector";
import WishlistHeart from "../wishlist/WishlistHeart";
import StarRating from "../StarRating";

function ProductCard({ product }) {
  const { cart, addToCart, updateQty } = useCart();
  const navigate = useNavigate();

  if (!product?._id) return null;

  const cartItem = cart.find((item) => item.product && item.product._id === product._id);
  const qty = cartItem?.qty || 0;
  const ratingValue = Number(product.averageRating || 0);
  const totalReviews = Number(product.totalReviews || 0);

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        source: "direct",
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            qty: 1,
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

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image-wrapper">
        <img src={`http://localhost:5000/uploads/${product.image}`} alt={product.name} />
      </Link>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.metal} | {product.occasion}</p>

        <div className="product-rating-row">
          <StarRating value={ratingValue} readonly size="small" />
          <span className="product-rating-text">
            {totalReviews > 0 ? `${ratingValue.toFixed(1)} (${totalReviews})` : "No reviews yet"}
          </span>
        </div>

        <div className="product-footer">
          <div className="product-price">Rs {product.price.toLocaleString("en-IN")}</div>
          <WishlistHeart product={product} />

          {qty === 0 ? (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button className="pill-button pill-small" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button className="pill-button pill-small" onClick={() => addToCart(product._id, 1)}>
                Add to Cart
              </button>
            </div>
          ) : (
            <QuantitySelector value={qty} onChange={(newQty) => updateQty(product._id, newQty)} />
          )}
        </div>
      </div>
    </article>
  );
}

export { ProductCard };
export default ProductCard;
