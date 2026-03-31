import React from "react";
import { Link } from "react-router-dom";

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: "facebook" },
  { href: "https://instagram.com", label: "Instagram", icon: "instagram" },
  { href: "https://twitter.com", label: "Twitter", icon: "twitter" },
  { href: "https://youtube.com", label: "YouTube", icon: "youtube" },
];

const contactItems = [
  {
    href: "https://maps.google.com/?q=Vaniyavad+Circle+Nadiad+Gujarat+387001",
    label: "Open location in maps",
    icon: "Loc",
    text: (
      <>
        Vaniyavad Circle
        <br />
        Nadiad, Gujarat 387001
      </>
    ),
    external: true,
  },
  {
    href: "tel:+919714907350",
    label: "Call Pariva Jewels",
    icon: "Call",
    text: "+91 97149 07350",
  },
  {
    href: "mailto:parivajewels@gmail.com",
    label: "Email Pariva Jewels",
    icon: "Mail",
    text: "parivajewels@gmail.com",
  },
  {
    href: "/quick-links#contact",
    label: "View business hours",
    icon: "Hours",
    text: (
      <>
        Mon-Sat: 10:00 AM - 8:00 PM
        <br />
        Sunday: 11:00 AM - 6:00 PM
      </>
    ),
  },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  const renderSocialIcon = (icon) => {
    switch (icon) {
      case "facebook":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-.9-.1-1.8-.1-1.8 0-3.1 1.1-3.1 3.3V11H9.5v3h2.6v8h1.4Z"
            />
          </svg>
        );
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.7A3.1 3.1 0 0 0 4.7 7.8v8.4a3.1 3.1 0 0 0 3.1 3.1h8.4a3.1 3.1 0 0 0 3.1-3.1V7.8a3.1 3.1 0 0 0-3.1-3.1H7.8Zm8.8 1.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.1A4.9 4.9 0 1 1 7.1 12 4.9 4.9 0 0 1 12 7.1Zm0 1.7A3.2 3.2 0 1 0 15.2 12 3.2 3.2 0 0 0 12 8.8Z"
            />
          </svg>
        );
      case "twitter":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.9 4H21l-4.6 5.2L22 20h-4.4l-3.5-4.9L9.8 20H7.7l4.9-5.6L2 4h4.5l3.2 4.6L13.8 4h2.1l-5 5.7 6.1 8.6L18.9 4Z"
            />
          </svg>
        );
      case "youtube":
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.6 7.2a2.9 2.9 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2A30.2 30.2 0 0 0 2 12a30.2 30.2 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2A30.2 30.2 0 0 0 22 12a30.2 30.2 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="premium-footer">
      <div className="footer-top-border"></div>

      <div className="footer-container">
        <div className="footer-grid">
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
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label={item.label}
                  title={item.label}
                >
                  <span className="social-icon">{renderSocialIcon(item.icon)}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="footer-section">
            <h3 className="section-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/home" className="footer-link">Home</Link></li>
              <li><Link to="/quick-links#about" className="footer-link">About Us</Link></li>
              <li><Link to="/quick-links#contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/account/profile" className="footer-link">My Account</Link></li>
            </ul>
          </div>

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

          <div className="footer-section">
            <h3 className="section-title">Contact Info</h3>
            <div className="contact-info">
              {contactItems.map((item) => {
                const content = (
                  <>
                    <span className="contact-icon">{item.icon}</span>
                    <span className="contact-text">{item.text}</span>
                  </>
                );

                if (item.href.startsWith("/")) {
                  return (
                    <Link key={item.label} to={item.href} className="contact-item contact-link" aria-label={item.label}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="contact-item contact-link"
                    aria-label={item.label}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                  >
                    {content}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {currentYear} Pariva Jewels. All rights reserved.</p>
            </div>
            <div className="footer-bottom-links">
              <Link to="/sitemap" className="bottom-link">Sitemap</Link>
              <span className="bottom-separator">&bull;</span>
              <Link to="/careers" className="bottom-link">Careers</Link>
              <span className="bottom-separator">&bull;</span>
              <Link to="/blog" className="bottom-link">Blog</Link>
            </div>
            <div className="design-credit">
              <p>Designed with <span className="heart">&hearts;</span> by Pariva Jewels</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
