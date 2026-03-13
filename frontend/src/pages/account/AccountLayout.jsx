import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  MdClose,
  MdFeedback,
  MdHome,
  MdLocationOn,
  MdLogout,
  MdManageAccounts,
  MdMenu,
  MdShoppingBag,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { clearUserSession } from "../../utils/authStorage";

export default function AccountLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/home", icon: MdHome },
    { label: "Profile", path: "/account/profile", icon: MdManageAccounts },
    { label: "Orders", path: "/account/orders", icon: MdShoppingBag },
    { label: "Addresses", path: "/account/addresses", icon: MdLocationOn },
    { label: "My Feedback", path: "/account/feedback", icon: MdFeedback },
  ];

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    logout();
    clearUserSession();
    window.location.replace("/login");
  };

  return (
    <div className="account-shell">
      <button
        type="button"
        className="account-sidebar-toggle"
        onClick={() => setIsMobileOpen((open) => !open)}
      >
        {isMobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
      </button>

      {isMobileOpen ? (
        <div
          className="account-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <aside className={`account-sidebar-panel ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="account-sidebar-header">
          <div className="account-sidebar-brand">
            <div className="account-brand-icon">P</div>
            <span className="account-brand-text">PARIVA</span>
          </div>
          <div className="account-sidebar-profile">
            <strong>{user?.name || "Pariva Member"}</strong>
            <span>{user?.email || "Fine jewellery member"}</span>
          </div>
        </div>

        <nav className="account-sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => {
                  const active =
                    isActive || location.pathname.startsWith(`${item.path}/`);
                  return `account-menu-item ${active ? "active" : ""}`;
                }}
                end={item.path === "/home"}
              >
                <span className="account-menu-icon">
                  <Icon size={20} />
                </span>
                <span className="account-menu-label">{item.label}</span>
                {(location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)) && (
                  <span className="account-menu-indicator" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="account-sidebar-footer">
          <button type="button" className="account-logout-btn" onClick={handleLogout}>
            <MdLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="account-layout-main">
        <div className="account-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
