import React from "react";
import { Link } from "react-router-dom";

function SitemapPage() {
  const sections = [
    {
      title: "Shop",
      links: [
        { to: "/home", label: "Home" },
        { to: "/category/rings", label: "Rings" },
        { to: "/category/necklaces", label: "Necklaces" },
        { to: "/category/earrings", label: "Earrings" },
        { to: "/wishlist", label: "Wishlist" },
      ],
    },
    {
      title: "Customer Help",
      links: [
        { to: "/customer-service#faq", label: "FAQ" },
        { to: "/customer-service#shipping", label: "Shipping Policy" },
        { to: "/customer-service#returns", label: "Return Policy" },
        { to: "/customer-service#terms", label: "Terms & Conditions" },
        { to: "/customer-service#privacy", label: "Privacy Policy" },
      ],
    },
    {
      title: "Company",
      links: [
        { to: "/quick-links#about", label: "About Us" },
        { to: "/quick-links#contact", label: "Contact Us" },
        { to: "/careers", label: "Careers" },
        { to: "/blog", label: "Blog" },
      ],
    },
  ];

  return (
    <div className="info-page">
      <div className="info-page-shell">
        <p className="info-page-kicker">Navigation Guide</p>
        <h1>Sitemap</h1>
        <p className="info-page-lead">
          This page brings together the most important sections of the website in one place, making navigation easier for users and supporting SEO.
        </p>

        <div className="info-page-grid">
          {sections.map((section) => (
            <section key={section.title} className="info-card">
              <h2>{section.title}</h2>
              <div className="info-link-list">
                {section.links.map((link) => (
                  <Link key={link.to} to={link.to} className="info-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SitemapPage;
