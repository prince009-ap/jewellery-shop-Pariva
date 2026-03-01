import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await API.post(`/auth/reset-password/${token}`, { password });
    navigate("/login");
  };

  return (
    <div className="auth-card">
      <h2>Reset Password</h2>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button>Update Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
