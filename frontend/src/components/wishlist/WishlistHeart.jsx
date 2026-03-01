import { useState } from "react";
import { useWishlist } from "../../context/useWishlist";
import WishlistDropdown from "./WishlistDropdown";

function WishlistHeart({ product }) {
  const [open, setOpen] = useState(false);
  const { wishlists } = useWishlist();

  const isInWishlist = wishlists.some(wl =>
    wl.products?.some(p => p._id === product._id)
  );

  return (
    <div style={{ position: "relative" }}>
      <button
        className="wishlist-heart"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {isInWishlist ? "❤️" : "🤍"}
      </button>

      {open && (
        <WishlistDropdown
          product={product}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default WishlistHeart;
