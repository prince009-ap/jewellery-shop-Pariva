import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";


export default function AccountSidebar() {
  const { user } = useAuth();

const handleLogout = async () => {
  try {
    await API.post("/auth/logout"); // 🔥 backend logout
  } catch (e) {
    console.error("Logout failed", e);
  }

  localStorage.removeItem("token");
  window.location.href = "/login"; // hard reset
};

  return (
    <aside className="account-sidebar">
      <h3>{user?.name}</h3>
      <p>{user?.email}</p>

      <NavLink to="/account/profile">Profile</NavLink>
      <NavLink to="/account/orders">Orders</NavLink>
      <NavLink to="/account/addresses">Addresses</NavLink>
      <NavLink to="/account/privacy">Account Privacy</NavLink>

      <button onClick={handleLogout}>Logout</button>
    </aside>
  );
}
