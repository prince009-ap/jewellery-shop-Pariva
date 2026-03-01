// import { useWishlist } from "../context/useWishlist";
// import  useCart  from "../context/useCart";

// function Wishlist() {
//   const { wishlists, removeFromWishlist, deleteWishlist } = useWishlist();
//   const { addToCart } = useCart();

//   return (
//     <div className="wishlist-page">
//       <h1>Your Wishlists</h1>

//       {wishlists.map((wl) => (
//         <div key={wl._id} className="wishlist-block">
//           <h2>
//             {wl.title}
//             <button onClick={() => deleteWishlist(wl._id)}>🗑</button>
//           </h2>

//           {wl.products.length === 0 ? (
//             <p>No items yet</p>
//           ) : (
//             wl.products.map((p) => (
//               <div key={p._id} className="wishlist-item">
//   {/* 🔧 FIX: image wrapper */}
//   <div className="wishlist-item-img">
//     <img
//       src={`http://localhost:5000/uploads/${p.image}`}
//       alt={p.name}
//     />
//   </div>

//   <div className="wishlist-item-info">
//     <h4>{p.name}</h4>
//     <p>₹{p.price}</p>

//     <button onClick={() => addToCart(p._id, 1)}>
//       Add to Cart
//     </button>

//     <button onClick={() => removeFromWishlist(wl._id, p._id)}>
//       Remove
//     </button>
//   </div>
// </div>

//             ))
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default Wishlist;
import { useWishlist } from "../context/useWishlist";
import useCart from "../context/useCart";
import QuantitySelector from "../components/common/QuantitySelector";

function Wishlist() {
  const { wishlists, removeFromWishlist, deleteWishlist } = useWishlist();
  const { cart, addToCart, updateQty } = useCart();

  return (
    <div className="wishlist-page">
      <h1>Your Wishlists</h1>

      {wishlists.map((wl) => (
        <div key={wl._id} className="wishlist-block">
          <h2>
            {wl.title}
            <button onClick={() => deleteWishlist(wl._id)}>🗑</button>
          </h2>

          {wl.products.length === 0 ? (
            <p>No items yet</p>
          ) : (
            wl.products.map((p) => {
              
              // 🔍 check cart for THIS product
              const cartItem = cart.find(
                (item) =>
                  item.product && item.product._id === p._id
              );

              const qty = cartItem?.qty || 0;

              return (
                <div key={p._id} className="wishlist-item">

                  <div className="wishlist-item-img">
                    <img
                      src={`http://localhost:5000/uploads/${p.image}`}
                      alt={p.name}
                    />
                  </div>

                  <div className="wishlist-item-info">
                    <h4>{p.name}</h4>
                    <p>₹{p.price}</p>

                    {qty === 0 ? (
                      <button
                        className="pill-button pill-small"
                        onClick={() => addToCart(p._id, 1)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <QuantitySelector
                        value={qty}
                        onChange={(newQty) =>
                          updateQty(p._id, newQty)
                        }
                      />
                    )}

                    <button
                      onClick={() =>
                        removeFromWishlist(wl._id, p._id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}

export default Wishlist;