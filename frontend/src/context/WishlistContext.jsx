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

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlists, setWishlists] = useState([]);

  const fetchWishlists = async () => {
    const res = await API.get("/wishlist",{ skipLoader: true });
    setWishlists(res.data);
  };

  const createWishlist = async (title) => {
    if (!title.trim()) return;
    await API.post("/wishlist", { title });
    fetchWishlists();
  };

  const addToWishlist = async (wishlistId, productId) => {
    await API.post("/wishlist/add", { wishlistId, productId });
    fetchWishlists();
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    await API.post("/wishlist/remove", { wishlistId, productId });
    fetchWishlists();
  };

  const deleteWishlist = async (wishlistId) => {
    await API.delete(`/wishlist/${wishlistId}`);
    fetchWishlists();
  };


  useEffect(() => {
    (async () => {
      await fetchWishlists();
    })();
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
