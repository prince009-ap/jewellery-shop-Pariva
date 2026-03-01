import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function QuickLinksPage() {
  const location = useLocation();

  useEffect(() => {
    // Handle hash scrolling on page load
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="quick-links-page" style={{ 
      fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      backgroundColor: 'white',
      minHeight: '100vh',
      paddingTop: '2rem'
    }}>
      
      {/* Main Title */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '4rem',
        padding: '0 2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700',
          color: '#d4af37',
          marginBottom: '1rem',
          letterSpacing: '0.05em'
        }}>
          Quick Links
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Navigate to important sections and information about PARIVA Jewellery
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>

        {/* About Us Section */}
        <section id="about" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            About Us
          </h2>
          <div style={{ 
            backgroundColor: '#fafafa',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem'
            }}>
              Our Story
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              PARIVA Jewellery represents the perfect blend of traditional craftsmanship and contemporary design. 
              Founded with a passion for creating timeless pieces that celebrate life's most precious moments, 
              we have been serving discerning customers with exquisite jewellery for over a decade.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Our Mission
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  To create beautiful, high-quality jewellery that makes every moment special while maintaining 
                  the highest standards of craftsmanship and customer service.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Our Values
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Quality, authenticity, and customer satisfaction are at the heart of everything we do. 
                  Each piece is carefully crafted and inspected to ensure it meets our exacting standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ 
          height: '1px', 
          background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          margin: '4rem 0',
          opacity: '0.3'
        }}></div>

        {/* Contact Us Section */}
        <section id="contact" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            Contact Us
          </h2>
          <div style={{ 
            backgroundColor: '#fafafa',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600',
              color: '#333',
              marginBottom: '1rem'
            }}>
              Get in Touch
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              We're here to help you with any questions, concerns, or special requests. 
              Our dedicated customer service team is available to assist you.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Store Location
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  <strong>PARIVA Jewellery</strong><br />
                  Vaniyavad Circle<br />
                  Nadiad, Gujarat 387001<br />
                  India
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Contact Information
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  <strong>Phone:</strong> +91 97149 07350<br />
                  <strong>Email:</strong> parivajewels@gmail.com<br />
                  <strong>WhatsApp:</strong> +91 97149 07350
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Business Hours
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Monday - Saturday: 10:00 AM - 8:00 PM<br />
                  Sunday: 11:00 AM - 6:00 PM<br />
                  <em>We're closed on major holidays</em>
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Customer Support
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  For order inquiries, product questions, or after-sales support:<br />
                  • Call us: +91 97149 07350<br />
                  • Email: support@parivajewels.com<br />
                  • Live chat available on website
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default QuickLinksPage;
