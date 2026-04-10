import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "../../components/common/DatePicker";
import SelectDropdown from "../../components/common/SelectDropdown";
import API from "../../services/api";
import "../auth.css";

function UserRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    dob: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.dob) {
      setError("Please select your date of birth");
      return;
    }

    if (!form.gender) {
      setError("Please select your gender");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        mobile: form.mobile.trim(),
        dob: form.dob,
        gender: form.gender,
      };

      await API.post("/auth/register", payload);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-shell">
        <aside className="auth-showcase">
          <div className="auth-showcase-copy">
            <span className="auth-eyebrow">Join Pariva</span>
            <h1>Create your jewellery profile in one elegant step.</h1>
            <p>
              Register once to unlock faster checkout, order tracking, wishlist syncing, and smoother
              support from our team.
            </p>
            <ul className="auth-showcase-points">
              <li>Save your delivery details and preferences for future orders.</li>
              <li>Track bespoke requests, purchases, and care support from one account.</li>
              <li>Designed to feel premium across desktop and mobile alike.</li>
            </ul>
          </div>

          <div className="auth-showcase-stats">
            <div className="auth-showcase-stat">
              <strong>01</strong>
              <span>Smart Signup</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Fast</strong>
              <span>Checkout Prep</span>
            </div>
            <div className="auth-showcase-stat">
              <strong>Ready</strong>
              <span>Wishlist Sync</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-top">
              <span className="auth-kicker">Customer Register</span>
              <span className="auth-step-badge">New Account</span>
            </div>
            <h2>Create your account</h2>
            <p>Join PARIVA for a refined shopping experience with all your essentials in one place.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-grid">
              <div className="auth-field auth-field-full">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="auth-field auth-field-full">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Mobile Number</label>
                <input
                  name="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={form.mobile}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  required
                />
              </div>

              <div className="auth-field">
                <label>Date of Birth</label>
                <DatePicker name="dob" value={form.dob} onChange={handleChange} />
              </div>

              <div className="auth-field">
                <label>Gender</label>
                <SelectDropdown
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                  placeholder="Select gender"
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="auth-actions">
              <button className="auth-button" type="submit">Create Account</button>
            </div>
          </form>

          <div className="auth-links">
            <Link to="/login">Already have an account? Sign in</Link>
            <Link to="/forgot-password">Need password help?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;
