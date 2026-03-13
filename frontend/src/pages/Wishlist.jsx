import { Link } from "react-router-dom";
import { useWishlist } from "../context/useWishlist";
import useCart from "../context/useCart";
import QuantitySelector from "../components/common/QuantitySelector";
import "./Wishlist.css";

function Wishlist() {
  const { wishlists, removeFromWishlist, deleteWishlist } = useWishlist();
  const { cart, addToCart, updateQty } = useCart();
  const totalItems = wishlists.reduce((sum, wl) => sum + (wl.products?.length || 0), 0);

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
                  🗑
                </button>
              </div>

              {wl.products.length === 0 ? (
                <div className="wishlist-empty-row">No items yet.</div>
              ) : (
                <div className="wishlist-items-grid">
                  {wl.products.map((p) => {
                    const cartItem = cart.find((item) => item.product && item.product._id === p._id);
                    const qty = cartItem?.qty || 0;

                    return (
                      <article key={p._id} className="wishlist-item">
                        <div className="wishlist-item-img">
                          <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.name} />
                        </div>

                        <div className="wishlist-item-info">
                          <h4>{p.name}</h4>
                          <p className="wishlist-item-price">Rs {Number(p.price || 0).toLocaleString("en-IN")}</p>

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
                                <QuantitySelector value={qty} onChange={(newQty) => updateQty(p._id, newQty)} />
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
              )}
            </section>
          ))
        )}
      </div>
      </div>
  );
}

export default Wishlist;
