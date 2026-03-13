import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const showToast = (message, type = "success") => {
    setToast({ open: true, type, message });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ open: false, type: "success", message: "" });
    }, 2400);
  };

  const loadUsers = useCallback(async () => {
    try {
      const res = await adminAPI.get("/admin/users");
      setUsers(res.data);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, [loadUsers]);

  const toggleUser = async (id) => {
    try {
      setBusyUserId(id);
      await adminAPI.patch(`/admin/users/${id}/toggle`);
      await loadUsers();
      showToast("User status updated");
    } catch {
      showToast("Failed to update user", "error");
    } finally {
      setBusyUserId("");
    }
  };

  const { totalUsers, activeUsers, blockedUsers } = useMemo(() => {
    const total = users.length;
    const blocked = users.filter((u) => u.isBlocked).length;
    return {
      totalUsers: total,
      blockedUsers: blocked,
      activeUsers: total - blocked,
    };
  }, [users]);

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {toast.open && (
        <div className={`au-toast au-toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <div className="au-shell">
        <nav className="au-breadcrumb">
          <button
            type="button"
            className="au-crumb-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Users</span>
        </nav>

        <header className="au-header">
          <div>
            <p className="au-kicker">PARIVA User Center</p>
            <h1>All Users</h1>
            <p>Manage accounts, access levels, and block status.</p>
          </div>

          <div className="au-metrics-grid">
            <div className="au-metric-card">
              <span>Total</span>
              <strong>{totalUsers}</strong>
            </div>
            <div className="au-metric-card">
              <span>Active</span>
              <strong>{activeUsers}</strong>
            </div>
            <div className="au-metric-card">
              <span>Blocked</span>
              <strong>{blockedUsers}</strong>
            </div>
          </div>
        </header>

        <section className="au-table-card">
          <div className="au-table-wrap">
            <table className="au-table">
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
                {users.map((u) => {
                  const isBusy = busyUserId === u._id;
                  return (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td className="au-email">{u.email}</td>
                      <td>{u.mobile || "-"}</td>
                      <td className="au-role">{u.role}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <span className={`au-status-pill ${u.isBlocked ? "blocked" : "active"}`}>
                          {u.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`au-action-btn ${u.isBlocked ? "unblock" : "block"}`}
                          onClick={() => toggleUser(u._id)}
                          disabled={isBusy}
                        >
                          {isBusy ? "Updating..." : u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && <div className="au-empty">No users found</div>}
        </section>
      </div>
    </div>
  );
}

export default AdminUsers;
