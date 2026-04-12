import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdHome,
  MdImage,
  MdShoppingCart,
  MdPeople,
  MdPalette,
  MdLocalOffer,
  MdFeedback,
  MdChat,
  MdMenu,
  MdClose,
  MdLogout,
} from "react-icons/md";
import "./AdminSidebar.css";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 1024;
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const showExpandedLabels = isOpen || isMobileOpen;

  // Close mobile sidebar when route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [location]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: MdHome,
      path: "/admin/dashboard",
    },
    {
      label: "Home Banners",
      icon: MdImage,
      path: "/admin/banners",
    },
    {
      label: "Manage Products",
      icon: MdShoppingCart,
      path: "/admin/products",
    },
    {
      label: "View Orders",
      icon: MdPalette,
      path: "/admin/orders",
    },
    {
      label: "View Users",
      icon: MdPeople,
      path: "/admin/users",
    },
    {
      label: "Customer Feedback",
      icon: MdFeedback,
      path: "/admin/reviews",
    },
    {
      label: "Live Chat",
      icon: MdChat,
      path: "/admin/live-chat",
    },
    {
      label: "Custom Designs",
      icon: MdPalette,
      path: "/admin/custom-design",
    },
    {
      label: "Manage Coupons",
      icon: MdLocalOffer,
      path: "/admin/coupons",
    },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="admin-sidebar-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? "open" : "collapsed"} ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">📿</div>
            {showExpandedLabels && <span className="admin-brand-text">PARIVA</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-menu-item ${active ? "active" : ""}`}
              >
                <span className="admin-menu-icon">
                  <Icon size={20} />
                </span>
                {showExpandedLabels && <span className="admin-menu-label">{item.label}</span>}
                {showExpandedLabels && active && <span className="admin-menu-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            <MdLogout size={20} />
            {showExpandedLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Desktop Collapse Toggle */}
      <button
        className="admin-sidebar-collapse-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Collapse" : "Expand"}
      >
        {isOpen ? "«" : "»"}
      </button>
    </>
  );
}

export default AdminSidebar;
