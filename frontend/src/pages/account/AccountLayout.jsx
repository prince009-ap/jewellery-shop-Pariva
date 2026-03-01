import { NavLink, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";


export default function AccountLayout() {
  const navigate = useNavigate();
  const handleLogout = async () => {
  await API.post("/auth/logout");   // ⭐ BACKEND STEP-5 HIT
  navigate("/login", { replace: true });
};

  return (
    <div className="account-page">
      <aside className="account-sidebar">
        <h2>My Account</h2>

        <NavLink to="/account/profile">Profile</NavLink>
        <NavLink to="/account/orders">Orders</NavLink>
        <NavLink to="/account/addresses">Addresses</NavLink>

        <button onClick={handleLogout}>Logout</button>

      </aside>

      <main className="account-content">
        <Outlet />
      </main>
    </div>
  );
}
