import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import DesignModal from "./DesignModal";
import "./AdminCustomDesigns.css";


export default function AdminCustomDesigns() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [sortBy, setSortBy] = useState("latest");

  const showToast = useCallback((message, type = "success") => {
    setToast({ open: true, message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ open: false, message: "", type: "success" });
    }, 2400);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await adminAPI.get("/admin/custom-design");
      setList(res.data);
    } catch {
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, [load]);

  const getStatusPillClass = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    return "pending";
  };

  const sortedList = useMemo(() => {
    const arr = [...list];

    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "status":
        arr.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
        break;
      case "jewellery":
        arr.sort((a, b) => (a.jewelleryType || "").localeCompare(b.jewelleryType || ""));
        break;
      case "latest":
      default:
        arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return arr;
  }, [list, sortBy]);

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading custom requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-custom-designs-page">
      {toast.open && (
        <div className={`acd-toast acd-toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <div className="acd-shell">
        <nav className="acd-breadcrumb">
          <button
            type="button"
            className="acd-crumb-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Custom Requests</span>
        </nav>

        <header className="acd-header">
          <div>
            <p className="acd-kicker">PARIVA Custom Studio</p>
            <h1>Custom Design Requests</h1>
            <p>Review and approve bespoke jewellery requests from users.</p>
          </div>
          <div className="acd-meta">Total: {list.length} requests</div>
        </header>

        <section className="acd-topbar-card">
          <div className="acd-sort-wrap">
            <label htmlFor="custom-design-sort">Sort By</label>
            <SelectDropdown
              id="custom-design-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: "latest", label: "Newest First" },
                { value: "oldest", label: "Oldest First" },
                { value: "status", label: "Status A-Z" },
                { value: "jewellery", label: "Jewellery A-Z" },
              ]}
            />
          </div>
        </section>

        <section className="acd-table-card">
          <div className="acd-table-wrap">
            <table className="acd-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Jewellery</th>
                  <th>Metal</th>
                  <th>Status</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((d) => (
                  <tr key={d._id}>
                    <td data-label="User" className="acd-user-cell">{d.userId?.name || "N/A"}</td>
                    <td data-label="Contact" className="acd-contact-cell">
                      <p>{d.userId?.email || "N/A"}</p>
                      <p>{d.userId?.mobile || "No mobile"}</p>
                    </td>
                    <td data-label="Jewellery">{d.jewelleryType || "N/A"}</td>
                    <td data-label="Metal">{d.metalType || "N/A"}</td>
                    <td data-label="Status">
                      <span className={`acd-status-pill ${getStatusPillClass(d.status)}`}>
                        {d.status || "pending"}
                      </span>
                    </td>
                    <td data-label="View">
                      <button type="button" className="acd-open-btn" onClick={() => setSelected(d)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <div className="acd-empty">No custom requests found</div>}
        </section>

        {selected && (
          <DesignModal
            design={selected}
            onClose={() => setSelected(null)}
            onUpdate={load}
            onNotify={showToast}
          />
        )}
      </div>
    </div>
  );
}
