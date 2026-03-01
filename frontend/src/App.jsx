// import { BrowserRouter } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { AdminAuthProvider } from "./context/AdminAuthContext";
// import AppRoutes from "./routes";
// import { CartProvider } from "./context/CartProvider";
// import { WishlistProvider } from "./context/WishlistContext";

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AdminAuthProvider>
//           <CartProvider>
//             <WishlistProvider>
//               <AppRoutes/>
//             </WishlistProvider>
//           </CartProvider>
//         </AdminAuthProvider>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartProvider";
import { WishlistProvider } from "./context/WishlistContext";
import LoaderProvider from "./context/LoaderProvider";
import { useLoader } from "./context/useLoader";


import AppRoutes from "./routes";
import Loader from "./components/Loader";
import { registerLoader } from "./services/api";

function AppContent() {
  const { loading, setLoading } = useLoader();

  useEffect(() => {
    registerLoader(setLoading);
  }, [setLoading]);

  return (
    <>
      {loading && <Loader full />}
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <LoaderProvider>
                <AppContent />
              </LoaderProvider>
            </WishlistProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
