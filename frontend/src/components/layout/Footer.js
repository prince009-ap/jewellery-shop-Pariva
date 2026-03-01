// src/components/layout/Footer.js
import React from "react";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">PARIVA</span>
          <p>Everyday fine jewellery, crafted with BIS-hallmarked trust.</p>
        </div>
        <div className="footer-links">
          <a href="#policies">Shipping & Returns</a>
          <a href="#policies">Warranty & Certification</a>
          <a href="#policies">Privacy & Terms</a>
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} PARIVA Jewels.</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;