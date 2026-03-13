import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { CartContext } from "./CartContext";
import { useAuth } from "./AuthContext";
import { getUserToken } from "../utils/authStorage";

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
// 🔐 remove invalid items
const safeCart = cart.filter(item => item.product);

  const fetchCart = useCallback(async () => {
    try {
      const res = await API.get("/cart" , {skipLoader: true, });
      
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Fetch cart failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

 useEffect(() => {
  const activeToken = token || getUserToken();
  if (activeToken) {
    setLoading(true);
    fetchCart();
  } else {
    setCart([]);
    setLoading(false);
  }
}, [fetchCart, token]);



const addToCart = async (productId, qty = 1) => {
  const activeToken = token || getUserToken();
  if (!activeToken) {
    alert("Please login to add items to cart");
    return;
  }
  await API.post("/cart/add", { productId, qty });
  fetchCart();
};

const updateQty = async (productId, qty) => {
  if (qty <= 0) {
    await API.delete(`/cart/remove/${productId}`);
  } else {
    await API.put("/cart/update", { productId, qty });
  }
  fetchCart();
};


const removeFromCart = useCallback(async (productId) => {
  await API.delete(`/cart/remove/${productId}`);
  fetchCart();
}, [fetchCart]);


 const totalItems = safeCart.reduce(
  (a, b) => a + (b?.qty || 0),
  0
);

  const totalPrice = safeCart.reduce((a, b) => {
  if (!b.product) return a;   // 🔥 NULL GUARD
  return a + b.qty * b.product.price;
}, 0);

useEffect(() => {
  const invalidItems = cart.filter(item => !item.product);

  if (invalidItems.length > 0) {
    invalidItems.forEach(item =>
      removeFromCart(item.productId)
    );
  }
}, [cart, removeFromCart]); // ✅ FIXED


  return (
    <CartContext.Provider
      value={{
        cart : safeCart,
        addToCart,
        updateQty,
        removeFromCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
