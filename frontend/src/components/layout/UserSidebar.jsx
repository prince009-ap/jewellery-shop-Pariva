import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdAutoAwesome,
  MdClose,
  MdFavoriteBorder,
  MdFeedback,
  MdHome,
  MdLocationOn,
  MdLogout,
  MdManageAccounts,
  MdMenu,
  MdShoppingCart,
  MdShoppingBag,
  MdTune,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import useCart from "../../context/useCart";
import { clearUserSession } from "../../utils/authStorage";
import "./UserSidebar.css";

function UserSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const displayName = useMemo(() => {
    return user?.name || "Pariva Member";
  }, [user]);

  const menuItems = [
    { label: "Home", icon: MdHome, path: "/home" },
    { label: "Wishlist", icon: MdFavoriteBorder, path: "/wishlist" },
    { label: "Cart", icon: MdShoppingCart, path: "/cart", badge: totalItems > 0 ? totalItems : null },
    { label: "Orders", icon: MdShoppingBag, path: "/account/orders" },
    { label: "Profile", icon: MdManageAccounts, path: "/account/profile" },
    { label: "Addresses", icon: MdLocationOn, path: "/account/addresses" },
    { label: "Custom Studio", icon: MdTune, path: "/custom-design" },
    { label: "My Custom Requests", icon: MdAutoAwesome, path: "/my-custom-designs" },
    { label: "My Feedback", icon: MdFeedback, path: "/account/feedback" },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = () => {
    logout();
    clearUserSession();
    window.location.href = "/login";
  };

  return (
    <>
      <button className="user-sidebar-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
      </button>

      {isMobileOpen ? <div className="user-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} /> : null}

      <aside className={`user-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="user-sidebar-header">
          <div className="user-sidebar-brand">
            <div className="user-brand-icon">P</div>
            <span className="user-brand-text">PARIVA</span>
          </div>

          <div className="user-sidebar-profile">
            <strong>{displayName}</strong>
            <span>{user?.email || "Fine jewellery member"}</span>
          </div>
        </div>

        <nav className="user-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`user-menu-item ${active ? "active" : ""}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="user-menu-icon">
                  <Icon size={20} />
                </span>
                <span className="user-menu-label">{item.label}</span>
                {item.badge ? <span className="user-menu-badge">{item.badge}</span> : null}
                {active ? <span className="user-menu-indicator" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="user-sidebar-footer">
          <button className="user-logout-btn" onClick={handleLogout}>
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default UserSidebar;
