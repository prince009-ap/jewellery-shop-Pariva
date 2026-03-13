import { useWishlist } from "../../context/useWishlist";
import { useState } from "react";

function WishlistModal({ product, onClose }) {
  const { wishlists, addToWishlist, createWishlist } = useWishlist();
  const [title, setTitle] = useState("");

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToWishlist = (wishlistId) => {
    addToWishlist(wishlistId, product._id);
    onClose();
  };

  const handleCreateAndAdd = async () => {
    if (title.trim()) {
      await createWishlist(title);
      setTitle("");
      onClose();
    }
  };

  return (
    <div className="wishlist-modal-overlay" onClick={handleOverlayClick}>
      <div className="wishlist-modal-card">
        <div className="wishlist-modal-header">
          <h3>Add to Wishlist</h3>
          <button className="wishlist-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wishlist-modal-content">
          {wishlists.length > 0 && (
            <div className="wishlist-list">
              <p className="wishlist-label">Your Wishlists</p>
              {wishlists.map(wl => (
                <button
                  key={wl._id}
                  className="wishlist-item"
                  onClick={() => handleAddToWishlist(wl._id)}
                >
                  {wl.title}
                </button>
              ))}
            </div>
          )}

          <div className="wishlist-divider" />

          <div className="wishlist-create">
            <p className="wishlist-label">Create New Wishlist</p>
            <input
              type="text"
              placeholder="Enter wishlist name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="wishlist-input"
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!title.trim()}
              className="wishlist-create-btn"
            >
              Create & Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishlistModal;
