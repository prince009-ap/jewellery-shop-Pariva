import React from "react";
import { Link } from "react-router-dom";

function BlogPage() {
  return (
    <div className="info-page">
      <div className="info-page-shell">
        <p className="info-page-kicker">Stories And Guides</p>
        <h1>Blog</h1>
        <p className="info-page-lead">
          The Blog page is designed for jewellery care tips, styling ideas, festive edits, buying guides, and brand updates.
        </p>

        <div className="info-page-grid">
          <section className="info-card">
            <h2>What Can Live Here</h2>
            <p>Jewellery care guides, ring size help, gifting ideas, metal comparison, bridal styling, and latest launches.</p>
          </section>

          <section className="info-card">
            <h2>Current Status</h2>
            <p>No blog articles have been published yet, so this page is currently serving as a placeholder.</p>
            <p>
              In the meantime, you can
              {" "}
              <Link to="/home" className="info-inline-link">
                browse the catalog
              </Link>
              {" "}
              or open the
              {" "}
              <Link to="/custom-design" className="info-inline-link">
                custom design studio
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BlogPage;
