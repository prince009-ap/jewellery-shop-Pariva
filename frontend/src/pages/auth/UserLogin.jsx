import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../auth.css";

function UserLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;
    if (!email.trim()) return setError("Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Please enter a valid email address");
    }
    if (!password.trim()) return setError("Please enter your password");

    try {
      setLoading(true);
      await API.post("/auth/login-password-otp", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      setStep(2);
    } catch (err) {
      console.error("Password verification error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;
    if (!otp.trim()) return setError("Please enter the OTP");
    if (!/^\d{6}$/.test(otp.trim())) return setError("OTP must be 6 digits");
    if (!email.trim()) return setError("Email is required");

    try {
      setLoading(true);
      const res = await API.post("/auth/verify-login-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (res.data.token && res.data.user) {
        await login(res.data.user, res.data.token);
      }

      navigate("/home", { replace: true });
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">Pariva Members</span>
            <h1>Luxury access with a secure two-step sign in.</h1>
            <p>
              Continue to your wishlist, orders, custom consultations, and saved jewellery picks in
              one polished flow.
            </p>
            <ul className="auth-showcase-points">
              <li>OTP verification keeps each account protected before checkout or profile access.</li>
              <li>Saved addresses, orders, and support history stay ready after login.</li>
              <li>Same premium tone as the rest of the PARIVA storefront.</li>
            </ul>
          </div>

          <div className="auth-showcase-stats">
            <div className="auth-showcase-stat">
              <strong>02</strong>
              <span>Secure Steps</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>24/7</strong>
              <span>Access Ready</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>100%</strong>
              <span>Pariva Style</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-kicker">Customer Login</span>
              <span className="auth-step-badge">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</span>
            </div>
            <h2>{step === 1 ? "Welcome back" : "Verify your login"}</h2>
            <p>
              {step === 1
                ? "Enter your account email and password to receive a verification code."
                : `A 6-digit code has been sent to ${email || "your email"}. Enter it below to continue.`}
            </p>
          </div>

          <div className="auth-progress">
            <div className={`auth-progress-step ${step === 1 ? "is-active" : ""}`}>
              <strong>1</strong>
              <span>Password</span>
            </div>
            <div className={`auth-progress-step ${step === 2 ? "is-active" : ""}`}>
              <strong>2</strong>
              <span>OTP Check</span>
            </div>
          </div>

          {step === 1 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div className="auth-actions">
                <button
                  className={`auth-button ${loading ? "button-loading" : ""}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="button-loading-content">
                      <span className="loading-spinner-small"></span>
                      Signing in...
                    </span>
                  ) : (
                    "Continue Securely"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <div className="auth-field">
                <label>One-Time Password</label>
                <input
                  className="auth-otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                  required
                />
                <p className="auth-field-note">Enter the 6-digit code sent to your email inbox.</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div className="auth-actions">
                <button
                  className={`auth-button ${loading ? "button-loading" : ""}`}
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                >
                  {loading ? (
                    <span className="button-loading-content">
                      <span className="loading-spinner-small"></span>
                      Verifying...
                    </span>
                  ) : (
                    "Verify And Enter"
                  )}
                </button>
                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Edit Login Details
                </button>
              </div>
            </form>
          )}

          <div className="auth-links">
            <Link to="/forgot-password">Forgot your password?</Link>
            <Link to="/register">I don&apos;t have an account</Link>
          </div>

          <div className="admin-entry">
            <span>Need the dashboard instead?</span>
            <Link to="/admin/login">Login as Admin</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
