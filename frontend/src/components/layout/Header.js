// src/components/layout/Header.js
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => navigate("/");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { type: "navlink", to: "/", label: "Home", end: true },
    { type: "anchor", href: "#discover", label: "Rings" },
    { type: "anchor", href: "#discover", label: "Earrings" },
    { type: "anchor", href: "#discover", label: "Necklaces" },
    { type: "link", to: "/custom-design", label: "Custom" },
    { type: "link", to: "/virtual-try-on", label: "Try-On" },
  ];

  const renderNavItem = (item, className = "") => {
    if (item.type === "navlink") {
      return (
        <NavLink key={item.label} to={item.to} end={item.end} className={className || undefined}>
          {item.label}
        </NavLink>
      );
    }

    if (item.type === "anchor") {
      return (
        <a key={item.label} href={item.href} className={className || undefined}>
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.label} to={item.to} className={className || undefined}>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header className="main-header">
        <div className="header-inner">
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "is-active" : ""}`}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <button className="logo" onClick={handleLogoClick}>
            <span className="logo-mark">P</span>
            <span className="logo-text">PARIVA</span>
          </button>

          <nav className="nav-links" aria-label="Primary Navigation">
            {navItems.map((item) => renderNavItem(item))}
          </nav>

          <div className="header-actions">
            <a className="pill-button" href="#search">
              Search
            </a>
            <Link className="pill-button" to="/login">
              Account
            </Link>
            <Link className="pill-button pill-accent" to="/cart">
              Cart
              {itemCount > 0 && <span className="pill-count">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close mobile menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <div
        id="mobile-site-menu"
        className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mobile-nav-shell">
          <div className="mobile-nav-header">
            <div>
              <p className="mobile-nav-kicker">Navigation</p>
              <strong>Browse Pariva</strong>
            </div>
            <button
              type="button"
              className="mobile-nav-close"
              aria-label="Close mobile menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            {navItems.map((item) => renderNavItem(item, "mobile-nav-link"))}
          </nav>

          <div className="mobile-nav-actions">
            <a className="pill-button" href="#search">
              Search
            </a>
            <Link className="pill-button" to="/login">
              Account
            </Link>
            <Link className="pill-button pill-accent" to="/cart">
              Cart
              {itemCount > 0 && <span className="pill-count">{itemCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
