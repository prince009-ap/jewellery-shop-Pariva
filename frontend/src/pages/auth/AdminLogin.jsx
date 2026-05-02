import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "../auth.css";

function AdminLogin() {
  const navigate = useNavigate();
  const { admin, setAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasToken = Boolean(sessionStorage.getItem("adminToken"));
    if (admin || hasToken) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [admin, navigate]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    if (loading) return;

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await API.post("/admin/login", {
        email: normalizedEmail,
        password: password.trim(),
      });

      if (res.data?.token && res.data?.admin) {
        sessionStorage.setItem("adminToken", res.data.token);
        setAdmin(res.data.admin);
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (res.data?.deliveryMode === "demo" && res.data?.demoOtp) {
        setInfoMessage(`${res.data.message} Demo OTP: ${res.data.demoOtp}`);
      } else if (res.data?.message) {
        setInfoMessage(res.data.message);
      }

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    if (loading) return;

    try {
      setLoading(true);
      const res = await API.post("/admin/verify-otp", {
        email: email.trim().toLowerCase(),
        emailOtp: emailOtp.trim(),
      });

      sessionStorage.setItem("adminToken", res.data.token);
      setAdmin(res.data.admin);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell auth-shell-admin auth-shell-compact">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">Admin Portal</span>
            <h1>Operations access with a sharper control-room feel.</h1>
            <p>
              Review orders, users, products, banners, and support activity from a secure OTP-backed
              admin entrance.
            </p>
            <ul className="auth-showcase-points">
              <li>Separate admin tone while still matching the storefront identity.</li>
              <li>Password and OTP flow protects dashboard access before session creation.</li>
              <li>Responsive layout keeps the control entry clean on every screen size.</li>
            </ul>
          </div>

          <div className="auth-showcase-stats">
            <div className="auth-showcase-stat">
              <strong>2FA</strong>
              <span>OTP Guard</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Live</strong>
              <span>Ops Access</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Fast</strong>
              <span>Dashboard Entry</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-kicker">Admin Login</span>
              <span className="auth-step-badge">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</span>
            </div>
            <h2>{step === 1 ? "Enter admin credentials" : "Confirm your OTP"}</h2>
            <p>
              {step === 1
                ? "Use your admin email and password to start the secure verification flow."
                : "Complete the email OTP step to unlock the admin dashboard session."}
            </p>
          </div>

          <div className="auth-progress">
            <div className={`auth-progress-step ${step === 1 ? "is-active" : ""}`}>
              <strong>1</strong>
              <span>Password</span>
            </div>
            <div className={`auth-progress-step ${step === 2 ? "is-active" : ""}`}>
              <strong>2</strong>
              <span>Email OTP</span>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {infoMessage && <div className="auth-message">{infoMessage}</div>}

          {step === 1 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="auth-field">
                <label>Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@pariva.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="auth-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className={`auth-button ${loading ? "button-loading" : ""}`}
                >
                  {loading ? (
                    <span className="button-loading-content">
                      <span className="loading-spinner-small"></span>
                      Verifying...
                    </span>
                  ) : (
                    "Continue To OTP"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="auth-field">
                <label>Email OTP</label>
                <input
                  className="auth-otp-input"
                  inputMode="numeric"
                  placeholder="000000"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  maxLength={6}
                  required
                />
                <p className="auth-field-note">Enter the code delivered to the admin mailbox.</p>
              </div>
              <div className="auth-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className={`auth-button ${loading ? "button-loading" : ""}`}
                >
                  {loading ? (
                    <span className="button-loading-content">
                      <span className="loading-spinner-small"></span>
                      Verifying...
                    </span>
                  ) : (
                    "Access Dashboard"
                  )}
                </button>
                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={() => {
                    setStep(1);
                    setEmailOtp("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Back To Credentials
                </button>
              </div>
            </form>
          )}

          <div className="auth-links">
            <Link to="/login">Switch to customer login</Link>
          </div>

          <div className="auth-panel-footnote">
            Admin access is kept separate from the customer experience, but styled to remain part of
            the same PARIVA system.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
