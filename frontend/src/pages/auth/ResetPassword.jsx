import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api";
import "../auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await API.post(`/auth/reset-password/${token}`, { password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell auth-shell-compact">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">New Password</span>
            <h1>Set a fresh password and step back into your account.</h1>
            <p>
              Choose a secure password that is easy for you to remember and strong enough for daily
              account protection.
            </p>
            <ul className="auth-showcase-points">
              <li>Clean two-field form with clearer reset guidance.</li>
              <li>Same luxury visual system carried through the recovery flow.</li>
              <li>Works smoothly on smaller mobile screens as well.</li>
            </ul>
          </div>

          <div className="auth-showcase-stats">
            <div className="auth-showcase-stat">
              <strong>Fresh</strong>
              <span>Password</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Safe</strong>
              <span>Recovery</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Quick</strong>
              <span>Back To Login</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-kicker">Reset Password</span>
              <span className="auth-step-badge">Final Step</span>
            </div>
            <h2>Choose a new password</h2>
            <p>Enter and confirm your new password below to finish the secure reset process.</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-actions">
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
