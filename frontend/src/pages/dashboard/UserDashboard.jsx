
import { useAuth } from "../../context/AuthContext.jsx";




export default function UserDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="user-dashboard-container">
      <h2>Welcome, {user?.name}</h2>
      <p>Email: {user?.email}</p>
      <p>Gender: {user?.gender}</p>
      <p>DOB: {new Date(user?.dob).toLocaleDateString()}</p>

      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );
}
