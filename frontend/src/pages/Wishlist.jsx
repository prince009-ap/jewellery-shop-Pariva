import { API_BASE_URL } from "../services/api";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/useWishlist";
import useCart from "../context/useCart";
import QuantitySelector from "../components/common/QuantitySelector";
import "./Wishlist.css";

function Wishlist() {
  const { wishlists, removeFromWishlist, deleteWishlist } = useWishlist();
  const { cart, addToCart, updateQty } = useCart();
  const totalItems = wishlists.reduce((sum, wl) => sum + (wl.products?.length || 0), 0);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 540 : false
  );
  const [activeSlides, setActiveSlides] = useState({});
  const railRefs = useRef({});

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 540);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="wishlist-page">
      <div className="wishlist-shell">
        <nav className="wishlist-breadcrumb">
          <Link to="/home">Home</Link>
          <span>&gt;</span>
          <span>Wishlist</span>
        </nav>

        <header className="wishlist-header">
          <div>
            <p className="wishlist-kicker">Personal Collection</p>
            <h1>Your Wishlists</h1>
            <p>Save products by occasion and move favorites to cart anytime.</p>
          </div>
          <div className="wishlist-meta">{totalItems} item(s)</div>
        </header>

        {wishlists.length === 0 ? (
          <section className="wishlist-empty-card">
            <h3>No wishlist yet</h3>
            <p>Browse products and tap the heart icon to start building your wishlist.</p>
            <Link to="/home" className="wishlist-home-link">
              Explore Products
            </Link>
          </section>
        ) : (
          wishlists.map((wl) => (
            <section key={wl._id} className="wishlist-block">
              <div className="wishlist-block-head">
                <div>
                  <h2>{wl.title}</h2>
                  <p>{wl.products.length} item(s)</p>
                </div>
                <button
                  type="button"
                  className="wishlist-delete-list-btn"
                  onClick={() => deleteWishlist(wl._id)}
                  aria-label="Delete wishlist"
                >
                  Delete
                </button>
              </div>

              {wl.products.length === 0 ? (
                <div className="wishlist-empty-row">No items yet.</div>
              ) : (
                <>
                <div
                  className={`wishlist-items-grid ${isMobileView ? "wishlist-items-rail" : ""}`}
                  ref={(node) => {
                    if (node) railRefs.current[wl._id] = node;
                  }}
                  onScroll={() => {
                    if (!isMobileView) return;
                    const rail = railRefs.current[wl._id];
                    if (!rail) return;
                    setActiveSlides((prev) => ({
                      ...prev,
                      [wl._id]: Math.round(rail.scrollLeft / rail.clientWidth),
                    }));
                  }}
                >
                  {wl.products.map((p) => {
                    const cartItem = cart.find((item) => item.product && item.product._id === p._id);
                    const qty = cartItem?.qty || 0;

                    return (
                      <article key={p._id} className="wishlist-item">
                        <div className="wishlist-item-img">
                          <img src={`${API_BASE_URL}/uploads/${p.image}`} alt={p.name} />
                        </div>

                        <div className="wishlist-item-info">
                          <h4>{p.name}</h4>
                          <p className="wishlist-item-price">
                            Rs {Number(p.price || 0).toLocaleString("en-IN")}
                          </p>

                          <div className="wishlist-item-actions">
                            {qty === 0 ? (
                              <button
                                type="button"
                                className="wishlist-action-btn primary"
                                onClick={() => addToCart(p._id, 1)}
                              >
                                Add to Cart
                              </button>
                            ) : (
                              <div className="wishlist-qty-wrap">
                                <QuantitySelector
                                  value={qty}
                                  onChange={(newQty) => updateQty(p._id, newQty)}
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              className="wishlist-action-btn ghost"
                              onClick={() => removeFromWishlist(wl._id, p._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {isMobileView && wl.products.length > 1 ? (
                  <div className="wishlist-mobile-dots" aria-label={`${wl.title} items`}>
                    {wl.products.map((_, index) => (
                      <button
                        key={`${wl._id}-dot-${index}`}
                        type="button"
                        className={`wishlist-mobile-dot ${
                          (activeSlides[wl._id] || 0) === index ? "active" : ""
                        }`}
                        onClick={() => {
                          const rail = railRefs.current[wl._id];
                          if (!rail) return;
                          rail.scrollTo({ left: rail.clientWidth * index, behavior: "smooth" });
                        }}
                        aria-label={`Go to wishlist item ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : null}
                </>
              )}
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default Wishlist;
