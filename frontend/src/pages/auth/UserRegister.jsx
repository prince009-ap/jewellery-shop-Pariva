import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/auth/register", form);
      navigate("/login" , { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join PARIVA for a refined jewellery experience</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Name</label>
            <input name="name" onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} required />
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
            <input name="password" type="password" onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label>Date of Birth</label>
            <input name="dob" type="date" onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label>Gender</label>
            <select name="gender" onChange={handleChange} required>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button">Create Account</button>
        </form>

        <div className="auth-links">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;
