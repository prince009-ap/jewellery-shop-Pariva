import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel</h2>
      <p>Logged in as: {user?.email}</p>

      <ul>
        <li>Manage Products</li>
        <li>Manage Orders</li>
        <li>Manage Users</li>
      </ul>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
