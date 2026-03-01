import { useWishlist } from "../../context/useWishlist";
import { useState } from "react";

function WishlistDropdown({ product, onClose }) {
  const { wishlists, addToWishlist, createWishlist } = useWishlist();
  const [title, setTitle] = useState("");

  return (
    <div className="wishlist-dropdown">
      {wishlists.map(wl => (
        <button
          key={wl._id}
          onClick={() => {
            addToWishlist(wl._id, product._id);
            onClose();
          }}
        >
          {wl.title}
        </button>
      ))}

      <hr />

      <input
        placeholder="Create another wishlist"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button
        onClick={() => {
          createWishlist(title);
          setTitle("");
          onClose();
        }}
      >
        Create
      </button>
    </div>
  );
}

export default WishlistDropdown;
