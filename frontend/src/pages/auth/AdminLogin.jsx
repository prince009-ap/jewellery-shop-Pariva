import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const { admin } = useAdminAuth();

useEffect(() => {
  const hasToken = Boolean(sessionStorage.getItem("adminToken"));
  if (admin || hasToken) {
    navigate("/admin/dashboard", { replace: true });
  }

}, [admin, navigate]);


  // STEP 1: Email + Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;
    
    try {
      setLoading(true);
      await API.post("/admin/login", { email, password });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Email OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;
    
    try {
      setLoading(true);
      const res = await API.post("/admin/verify-otp", {
        email,
        emailOtp,
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
      <div className="auth-card">
        <h2>Admin Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {step === 1 && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={loading ? 'button-loading' : ''}
              style={{ 
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <span className="button-loading-content">
                  <span className="loading-spinner-small"></span>
                  Verifying...
                </span>
              ) : (
                'Verify Password'
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <input
              placeholder="Enter Email OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              disabled={loading}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className={loading ? 'button-loading' : ''}
              style={{ 
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
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

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              background: "transparent",
              border: "none",
              color: "#1f2937",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Login as User
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
