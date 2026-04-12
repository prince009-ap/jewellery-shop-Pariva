import { useState } from "react";
import { createPortal } from "react-dom";
import { useWishlist } from "../../context/useWishlist";
import WishlistModal from "./WishlistModal";
import { getUserToken } from "../../utils/authStorage";
import { useAuthPrompt } from "../../context/AuthPromptContext";

function WishlistHeart({ product }) {
  const [open, setOpen] = useState(false);
  const { wishlists, removeFromWishlist } = useWishlist();
  const { showAuthPrompt } = useAuthPrompt();

  const isInWishlist = wishlists.some((wl) =>
    wl.products?.some((p) => p._id === product?._id)
  );

  const handleClick = async (e) => {
    e.stopPropagation();

    if (!getUserToken()) {
      showAuthPrompt("Please sign in to save this design to your wishlist.");
      return;
    }

    if (isInWishlist) {
      const containingWishlist = wishlists.find((wl) =>
        wl.products?.some((p) => p._id === product?._id)
      );

      if (containingWishlist?._id && product?._id) {
        await removeFromWishlist(containingWishlist._id, product._id);
      }

      setOpen(false);
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={`wishlist-heart ${isInWishlist ? "active" : ""}`}
        onClick={handleClick}
        aria-label={isInWishlist ? "In wishlist" : "Add to wishlist"}
        title={isInWishlist ? "In wishlist" : "Add to wishlist"}
      >
        {isInWishlist ? "\u2665" : "\u2661"}
      </button>

      {open && createPortal(
        <WishlistModal product={product} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}

export default WishlistHeart;
