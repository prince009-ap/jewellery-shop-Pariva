import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

function CustomerServicePage() {
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
    <div className="customer-service-page" style={{ 
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
          Customer Service
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Find answers to common questions and learn about our policies
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>

        {/* FAQ Section */}
        <section id="faq" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            FAQ
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
              Frequently Asked Questions
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              Find answers to the most common questions about our products, services, and policies. 
              Our comprehensive FAQ section covers everything from product care to order tracking.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  How do I track my order?
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  You can track your order by logging into your account and viewing the order history, 
                  or use the tracking number provided in your confirmation email.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  What is your return policy?
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  We offer a 30-day return policy for all unused items in original packaging. 
                  Please refer to our Return & Refund Policy section for detailed information.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Are your products certified?
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Yes, all our jewellery is BIS Hallmark certified and comes with authenticity certificates 
                  for precious metals and gemstones.
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

        {/* Shipping Policy Section */}
        <section id="shipping" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            Shipping Policy
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
              Free Insured Shipping
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              We offer free insured shipping on all orders within India. Your jewellery is carefully 
              packaged and fully insured during transit to ensure it reaches you safely.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Delivery Time
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Standard delivery: 5-7 business days<br />
                  Express delivery: 2-3 business days<br />
                  International shipping: 10-15 business days
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Packaging
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  All items are packaged in premium PARIVA jewellery boxes with authentication 
                  certificates and care instructions.
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

        {/* Return & Refund Policy Section */}
        <section id="returns" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            Return & Refund Policy
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
              30-Day Return Policy
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              We want you to love your PARIVA jewellery. If you're not completely satisfied, 
              you can return your purchase within 30 days for a full refund or exchange.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Return Conditions
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  • Item must be unused and in original packaging<br />
                  • All tags and certificates must be intact<br />
                  • Return shipping fee may apply for non-defective items
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Refund Process
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Refunds are processed within 5-7 business days after we receive the returned item. 
                  The amount will be credited to your original payment method.
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

        {/* Terms & Conditions Section */}
        <section id="terms" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            Terms & Conditions
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
              Terms of Service
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              By using the PARIVA website and purchasing our products, you agree to comply 
              with and be bound by the following terms and conditions.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Product Information
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  We strive to provide accurate product descriptions and images. However, 
                  slight variations may occur due to the nature of handmade jewellery and 
                  photography lighting conditions.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Pricing
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  All prices are inclusive of taxes. We reserve the right to modify prices 
                  without prior notice. Prices displayed at the time of purchase are final.
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Intellectual Property
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  All designs, content, and materials on this website are the intellectual 
                  property of PARIVA and are protected by copyright and trademark laws.
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

        {/* Privacy Policy Section */}
        <section id="privacy" style={{ marginBottom: '5rem' }}>
          <h2 style={{ 
            fontSize: '2.2rem', 
            fontWeight: '600',
            color: '#d4af37',
            marginBottom: '2rem',
            letterSpacing: '0.03em'
          }}>
            Privacy Policy
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
              Your Privacy Matters
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: '#666',
              lineHeight: '1.8',
              marginBottom: '1.5rem'
            }}>
              At PARIVA, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This policy outlines how we collect, use, and 
              protect your data.
            </p>
            <div style={{ spaceY: '1rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Information We Collect
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  • Personal information (name, email, phone, address)<br />
                  • Payment information (encrypted and secure)<br />
                  • Browsing behavior and preferences<br />
                  • Purchase history and preferences
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  How We Use Your Information
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  • Process and fulfill your orders<br />
                  • Provide customer support<br />
                  • Send promotional offers (with your consent)<br />
                  • Improve our products and services
                </p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#d4af37', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Data Security
                </h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  We use industry-standard encryption and security measures to protect your 
                  data. Your information is never shared with third parties without your 
                  explicit consent, except as required by law.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default CustomerServicePage;
