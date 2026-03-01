import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="premium-footer">
      {/* Top Gold Border */}
      <div className="footer-top-border"></div>
      
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* Brand Section */}
          <div className="footer-section brand-section">
            <div className="brand-logo">
              <span className="brand-text">PARIVA JEWELS</span>
            </div>
            <p className="brand-description">
              Exquisite craftsmanship meets timeless elegance. 
              Discover our curated collection of fine jewellery, 
              where each piece tells a story of luxury and love.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">f</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">📷</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">𝕏</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">▶</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="section-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/home" className="footer-link">Home</Link></li>
              <li><Link to="/quick-links#about" className="footer-link">About Us</Link></li>
              <li><Link to="/quick-links#contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/profile" className="footer-link">My Account</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3 className="section-title">Customer Service</h3>
            <ul className="footer-links">
              <li><Link to="/customer-service#faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/customer-service#shipping" className="footer-link">Shipping Policy</Link></li>
              <li><Link to="/customer-service#returns" className="footer-link">Return & Refund Policy</Link></li>
              <li><Link to="/customer-service#terms" className="footer-link">Terms & Conditions</Link></li>
              <li><Link to="/customer-service#privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="section-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span className="contact-text">
                  Vaniyavad circle<br />
                  Nadiad, Gujarat 387001
                </span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">+91 97149 07350</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span className="contact-text">parivajewels@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🕐</span>
                <span className="contact-text">
                  Mon-Sat: 10:00 AM - 8:00 PM<br />
                  Sunday: 11:00 AM - 6:00 PM
                </span>
              </div>
            </div>
          </div>

         
       
        </div>

        {/* Elegant Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Pariva Jewels. All rights reserved.</p>
            </div>
            <div className="footer-bottom-links">
              <Link to="/sitemap" className="bottom-link">Sitemap</Link>
              <span className="bottom-separator">•</span>
              <Link to="/careers" className="bottom-link">Careers</Link>
              <span className="bottom-separator">•</span>
              <Link to="/blog" className="bottom-link">Blog</Link>
            </div>
            <div className="design-credit">
              <p>Designed with <span className="heart">❤️</span> by Pariva Jewels</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
