import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "../auth.css";

function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1=password, 2=otp
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= STEP 1: PASSWORD CHECK =================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;

    // ✅ VALIDATION: Check email
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    // ✅ VALIDATION: Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // ✅ VALIDATION: Check password
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    try {
      setLoading(true);
      // ✅ FIXED API REQUEST: Proper data structure
      await API.post("/auth/login-password-otp", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      // ✅ password correct → OTP sent
      setStep(2);
    } catch (err) {
      console.error("Password verification error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= STEP 2: OTP VERIFY =================
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (loading) return;

    // ✅ VALIDATION: Check OTP value
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    // ✅ VALIDATION: Check OTP format (6 digits)
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must be 6 digits");
      return;
    }

    // ✅ VALIDATION: Check email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      // ✅ FIXED API REQUEST: Proper headers and data structure
      const res = await API.post("/auth/verify-login-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // ✅ FIXED: Store token properly
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("OTP verification error:", err);
      
      // ✅ BETTER ERROR HANDLING
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Secure login to PARIVA</p>
        </div>

        {/* ===== STEP 1: PASSWORD ===== */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handlePasswordSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              className={`auth-button ${loading ? 'button-loading' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="loading-spinner-small"></span>
                  Signing in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        )}

        {/* ===== STEP 2: OTP ===== */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleOtpSubmit}>
            <div className="auth-field">
              <label>Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  // ✅ Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setOtp(value);
                }}
                disabled={loading}
                required
                style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '18px' }}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                Enter the 6-digit code sent to your email
              </small>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              className={`auth-button ${loading ? 'button-loading' : ''}`}
              type="submit"
              disabled={otp.length !== 6 || loading}
              style={{ 
                opacity: otp.length === 6 && !loading ? 1 : 0.6,
                cursor: otp.length === 6 && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="loading-spinner-small"></span>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/forgot-password">Forgot your password?</Link>
          <Link to="/register">I don’t have an account</Link>
        </div>

        <div className="admin-entry">
          <Link to="/admin/login">Login as Admin</Link>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
