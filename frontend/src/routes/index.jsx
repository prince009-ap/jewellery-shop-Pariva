import { Routes, Route } from "react-router-dom";

import UserLogin from "../pages/auth/UserLogin";
import UserRegister from "../pages/auth/UserRegister";
import AdminLogin from "../pages/auth/AdminLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import CustomerServicePage from "../pages/auth/CustomerServicePage";
import QuickLinksPage from "../pages/auth/QuickLinksPage";
import Home from "../pages/auth/Home";
import CustomDesignForm from "../pages/custom/CustomDesignForm";
import AdminProduct from "../admin/pages/AdminProduct";
import ProductList from "../admin/pages/ProductList";
import AddProduct from "../admin/pages/AddProducts";
import EditProduct from "../admin/pages/EditProduct";
import UserRoute from "./UserRoute";
import Cart from "../pages/Cart";
import AdminDashboard from "../admin/pages/AdminDashboard";
import AdminOrderDetails from "../admin/pages/AdminOrderDetails";
import BannerManager from "../admin/pages/BannerManager";
import MyCustomDesigns from "../pages/account/CustomDesignStatus";
import AdminUsers from "../admin/pages/AdminUsers";
import AddBanner from "../admin/pages/AddBanner";
import AdminCustomDesigns from "../pages/custom/AdminCustomDesigns";
import AdminCoupons from "../pages/AdminCoupons";
import AdminOrders from "../admin/pages/AdminOrders";
import ReviewManagement from "../admin/pages/ReviewManagement";

import Payment from "../pages/checkout/Payment";

import OrderTracking from "../pages/account/OrderTracking";

import AccountLayout from "../pages/account/AccountLayout";
import Profile from "../pages/account/Profile";
import Orders from "../pages/account/Orders";
import Addresses from "../pages/account/Addresses";
import Checkout from "../pages/checkout/Checkout";
import Wishlist from "../pages/Wishlist";

import CategoryListing from "../pages/category/CategoryListing";
import ProductDetail from "../pages/product/ProductDetail";

import AdminRoute from "./AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= USER (PUBLIC) ================= */}
      <Route path="/" element={<UserLogin />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/product/:id"
        element={
          <UserRoute>
            <ProductDetail />
          </UserRoute>
        }
      />

      <Route path="/cart" element={<Cart />} />

      {/* ================= USER DASHBOARD ================= */}
      <Route path="/home" element={<Home />} />

      {/* ================= CATEGORY PAGES ================= */}
      <Route path="/category/:category" element={<CategoryListing />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/tracking/:id" element={<OrderTracking />} />
        <Route path="addresses" element={<Addresses />} />
      </Route>

      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />

      <Route
        path="/checkout/payment"
        element={
          <UserRoute>
            <Payment />
          </UserRoute>
        }
      />

      <Route
        path="/custom-design"
        element={
          <UserRoute>
            <CustomDesignForm />
          </UserRoute>
        }
      />
<Route path="/customer-service" element={<CustomerServicePage />} />
<Route path="/quick-links" element={<QuickLinksPage />} />
      <Route
        path="/admin/banners"
        element={
          <AdminRoute>
            <BannerManager />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/banners/add"
        element={
          <AdminRoute>
            <AddBanner />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/custom-design"
        element={
          <AdminRoute>
            <AdminCustomDesigns />
          </AdminRoute>
        }
      />

      <Route
        path="/my-custom-designs"
        element={
          <UserRoute>
            <MyCustomDesigns />
          </UserRoute>
        }
      />

      <Route
        path="/admin/coupons"
        element={
          <AdminRoute>
            <AdminCoupons />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/orders/:id"
        element={
          <AdminRoute>
            <AdminOrderDetails />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <ReviewManagement />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <ProductList />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/products/add"
        element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminRoute>
            <EditProduct />
          </AdminRoute>
        }
      />
    </Routes>
  );
}