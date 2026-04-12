// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useEffect, useState } from "react";
// import API from "../services/api";

// export const WishlistContext = createContext();

// export const WishlistProvider = ({ children }) => {
//   const [wishlists, setWishlists] = useState([]);

//   const fetchWishlists = async () => {
//     const res = await API.get("/wishlist");
//     setWishlists(res.data);
//   };

//  const createWishlist = async (title) => {
//   if (!title.trim()) return;

//   // 🔧 FIX: duplicate title check (frontend)
//   const exists = wishlists.some(
//     (w) => w.title.toLowerCase() === title.toLowerCase()
//   );

//   if (exists) {
//     alert("Wishlist already exists"); // 🔧 FIX
//     return;
//   }

//   await API.post("/wishlist", { title });
//   fetchWishlists(); // 🔧 FIX: refresh list
// };


//   const toggleProduct = async (wishlistId, productId) => {
//     await API.post("/wishlist/toggle", { wishlistId, productId });
//     fetchWishlists();
//   };

// //   useEffect(() => {
// //     (async () => {
// //       await fetchWishlists();
// //     })();
// //   }, []);

//   return (
//     <WishlistContext.Provider
//       value={{ wishlists, createWishlist, toggleProduct }}
//     >
//       {children}
//     </WishlistContext.Provider>
//   );
// };
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import API from "../services/api";
import { getUserToken } from "../utils/authStorage";
import { useAuthPrompt } from "./AuthPromptContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlists, setWishlists] = useState([]);
  const { showAuthPrompt } = useAuthPrompt();

  const fetchWishlists = async () => {
    if (!getUserToken()) {
      setWishlists([]);
      return;
    }

    const res = await API.get("/wishlist",{ skipLoader: true });
    setWishlists(res.data);
  };

  const createWishlist = async (title) => {
    if (!title.trim()) return;
    if (!getUserToken()) {
      showAuthPrompt("Please sign in to create and save a wishlist.");
      return { ok: false, requiresAuth: true };
    }
    await API.post("/wishlist", { title });
    await fetchWishlists();
    return { ok: true };
  };

  const addToWishlist = async (wishlistId, productId) => {
    if (!getUserToken()) {
      showAuthPrompt("Please sign in to save items to your wishlist.");
      return { ok: false, requiresAuth: true };
    }
    await API.post("/wishlist/add", { wishlistId, productId });
    await fetchWishlists();
    return { ok: true };
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    if (!getUserToken()) {
      showAuthPrompt("Please sign in to manage your wishlist.");
      return { ok: false, requiresAuth: true };
    }
    await API.post("/wishlist/remove", { wishlistId, productId });
    await fetchWishlists();
    return { ok: true };
  };

  const deleteWishlist = async (wishlistId) => {
    if (!getUserToken()) {
      showAuthPrompt("Please sign in to manage your wishlist.");
      return { ok: false, requiresAuth: true };
    }
    await API.delete(`/wishlist/${wishlistId}`);
    await fetchWishlists();
    return { ok: true };
  };


  useEffect(() => {
    void fetchWishlists();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlists,
        createWishlist,
        addToWishlist,
        removeFromWishlist,
        deleteWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
