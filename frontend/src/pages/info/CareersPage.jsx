import React from "react";
import { Link } from "react-router-dom";

function CareersPage() {
  return (
    <div className="info-page">
      <div className="info-page-shell">
        <p className="info-page-kicker">Join The Team</p>
        <h1>Careers</h1>
        <p className="info-page-lead">
          The Careers page is meant to highlight job openings, internships, the hiring process, and the culture of the company.
        </p>

        <section className="info-card">
          <h2>Work With Pariva</h2>
          <p>
            We welcome applications for roles across retail, customer support, catalog management, jewellery design, and digital operations.
          </p>
          <p>
            To apply, send your resume to
            {" "}
            <a className="info-inline-link" href="mailto:careers@parivajewels.com">
              careers@parivajewels.com
            </a>
          </p>
          <p>
            To learn more about the brand, you can also visit
            {" "}
            <Link to="/quick-links#about" className="info-inline-link">
              About Us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

export default CareersPage;
