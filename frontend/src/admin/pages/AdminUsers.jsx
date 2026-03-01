import { useEffect, useState } from "react";
import adminAPI from "../../services/adminApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await adminAPI.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Failed to load users" , err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = async (id) => {
    await adminAPI.patch(`/admin/users/${id}/toggle`);
    loadUsers();
  };

  if (loading) return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="loading-spinner loading-spinner-large"></div>
        <div className="page-loading-text">Loading users...</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 30 }}>
      <h2>All Users</h2>

      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.mobile || "—"}</td>
              <td>{u.role}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td
                style={{
                  color: u.isBlocked ? "red" : "green",
                  fontWeight: "bold",
                }}
              >
                {u.isBlocked ? "Blocked" : "Active"}
              </td>
              <td>
                <button
                  onClick={() => toggleUser(u._id)}
                  style={{
                    background: u.isBlocked ? "#2e7d32" : "#c62828",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
