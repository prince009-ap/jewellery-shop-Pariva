// import React, { useState, useEffect } from 'react';
// import API from '../../services/api';

// export default function WorkingWishlistHeart({ product }) {
//   const [isInWishlist, setIsInWishlist] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     checkWishlistStatus();
//   }, [product._id]);

//   const checkWishlistStatus = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setIsInWishlist(false);
//         return;
//       }

//       const response = await API.get('/wishlist', { skipLoader: true });
//       const wishlist = response.data || [];
//       const productInWishlist = wishlist.some(item => 
//         item.product && item.product._id === product._id
//       );
//       setIsInWishlist(productInWishlist);
//     } catch (error) {
//       console.error('Failed to check wishlist status:', error);
//       setIsInWishlist(false);
//     }
//   };

//   const toggleWishlist = async (e) => {
//     e.stopPropagation();
    
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('Please login to add items to wishlist');
//       return;
//     }

//     if (loading) return;

//     try {
//       setLoading(true);
      
//       if (isInWishlist) {
//         // Remove from wishlist
//         await API.post('/wishlist/remove', { productId: product._id });
//         setIsInWishlist(false);
//         alert('Removed from wishlist');
//       } else {
//         // Add to wishlist
//         await API.post('/wishlist/add', { productId: product._id });
//         setIsInWishlist(true);
//         alert('Added to wishlist');
//       }
//     } catch (error) {
//       console.error('Wishlist operation failed:', error);
//       alert(isInWishlist ? 'Failed to remove from wishlist' : 'Failed to add to wishlist');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button
//       onClick={toggleWishlist}
//       disabled={loading}
//       style={{
//         background: 'none',
//         border: 'none',
//         cursor: loading ? 'not-allowed' : 'pointer',
//         fontSize: '1.25rem',
//         padding: '0.5rem',
//         borderRadius: '50%',
//         transition: 'all 0.2s ease',
//         opacity: loading ? 0.6 : 1
//       }}
//       title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
//     >
//       {loading ? (
//         <div style={{ 
//           width: '20px', 
//           height: '20px', 
//           border: '2px solid #d4af37', 
//           borderTop: '2px solid transparent',
//           borderRadius: '50%',
//           animation: 'spin 1s linear infinite'
//         }} />
//       ) : (
//         <span style={{ 
//           color: isInWishlist ? '#e11d48' : '#9ca3af',
//           transition: 'color 0.2s ease'
//         }}>
//           {isInWishlist ? '❤️' : '🤍'}
//         </span>
//       )}
//     </button>
//   );
// }

// // Add spinning animation
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// `;
// document.head.appendChild(style);

import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";

export default function WorkingWishlistHeart({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkWishlistStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !product?._id) {
        setIsInWishlist(false);
        return;
      }

      const response = await API.get("/wishlist");
      const wishlist = response.data || [];

      const exists = wishlist.some(
        (item) => item.product && item.product._id === product._id
      );

      setIsInWishlist(exists);
    } catch (error) {
      console.error("Wishlist status check failed:", error);
      setIsInWishlist(false);
    }
  }, [product?._id]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);

  const toggleWishlist = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isInWishlist) {
        await API.post("/wishlist/remove", {
          productId: product._id,
        });
        setIsInWishlist(false);
      } else {
        await API.post("/wishlist", {
          productId: product._id,
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "1.5rem",
        opacity: loading ? 0.7 : 1,
        transition: "opacity 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {loading ? (
        <div style={{
          width: "20px",
          height: "20px",
          border: "2px solid #f3f4f6",
          borderTop: "2px solid #d4af37",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      ) : (
        <span style={{ 
          color: isInWishlist ? "#e11d48" : "#9ca3af",
          transition: "color 0.2s ease"
        }}>
          {isInWishlist ? "❤️" : "🤍"}
        </span>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}