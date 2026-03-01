import { useState } from "react";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await API.post("/auth/forgot-password", {
      email,
      role: "user",
    });
    setMsg("Reset link sent. Check email.");
    console.log(res.data.resetUrl); // dev only
  };

  return (
    <div className="auth-card">
      <h2>Forgot Password</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Enter registered email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button>Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default ForgotPassword;
