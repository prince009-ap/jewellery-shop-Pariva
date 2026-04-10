import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "../auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", {
        email,
        role: "user",
      });
      setMsg("Reset link sent. Check your email for the next step.");
      console.log(res.data.resetUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell auth-shell-compact">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">Recovery</span>
            <h1>Get back into your account without breaking the premium flow.</h1>
            <p>
              Share your registered email and we will send you a secure reset link so you can return
              to shopping smoothly.
            </p>
            <ul className="auth-showcase-points">
              <li>Simple recovery path for existing PARIVA customers.</li>
              <li>Reset happens through a unique secure link delivered to your inbox.</li>
              <li>Styled to match the same elevated website experience.</li>
            </ul>
          </div>

          <div className="auth-showcase-stats">
            <div className="auth-showcase-stat">
              <strong>Email</strong>
              <span>Recovery Link</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Safe</strong>
              <span>Reset Flow</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Easy</strong>
              <span>Return Path</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-kicker">Forgot Password</span>
              <span className="auth-step-badge">Reset Access</span>
            </div>
            <h2>Reset your password</h2>
            <p>Enter the email linked to your PARIVA account and we&apos;ll send a reset link.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label>Registered Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {msg && <div className="auth-message">{msg}</div>}

            <div className="auth-actions">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </div>
          </form>

          <div className="auth-links">
            <Link to="/login">Back to sign in</Link>
            <Link to="/register">Create a new account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
