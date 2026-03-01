// src/components/layout/Header.js
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogoClick = () => navigate("/");

  return (
    <header className="main-header">
      <div className="header-inner">
        <button className="logo" onClick={handleLogoClick}>
          <span className="logo-mark">P</span>
          <span className="logo-text">PARIVA</span>
        </button>

        <nav className="nav-links" aria-label="Primary Navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <a href="#discover">Rings</a>
          <a href="#discover">Earrings</a>
          <a href="#discover">Necklaces</a>
          <Link to="/custom-design">Custom</Link>
          <Link to="/virtual-try-on">Try-On</Link>
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

        <button className="mobile-menu-toggle" aria-label="Menu">
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

export default Header;