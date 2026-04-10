import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "../components/common/DatePicker";
import SelectDropdown from "../components/common/SelectDropdown";
import adminAPI from "../services/adminApi";
import "./AdminCoupons.css";

function AdminCoupons() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCouponId, setBusyCouponId] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const [form, setForm] = useState({
    code: "",
    discountType: "flat",
    discountValue: "",
    minOrderValue: "",
    expiryDate: "",
    firstOrderOnly: false,
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ open: true, type, message });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ open: false, type: "success", message: "" });
    }, 2400);
  }, []);

  const loadCoupons = useCallback(async () => {
    try {
      const res = await adminAPI.get("/admin/coupons");
      setCoupons(res.data);
    } catch {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCoupons();
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, [loadCoupons]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const createCoupon = async () => {
    if (!form.code || !form.discountValue || (!form.expiryDate && !form.firstOrderOnly)) {
      showToast("Please fill required fields", "error");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue || 0),
        firstOrderOnly: Boolean(form.firstOrderOnly),
      };

      // If first-order coupon, do not send expiry date to avoid default 1970 value
      if (payload.firstOrderOnly) {
        delete payload.expiryDate;
      }

      await adminAPI.post("/admin/coupons", payload);

      showToast("Coupon created");
      setForm({
        code: "",
        discountType: "flat",
        discountValue: "",
        minOrderValue: "",
        expiryDate: "",
        firstOrderOnly: false,
      });
      await loadCoupons();
    } catch {
      showToast("Failed to create coupon", "error");
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setBusyCouponId(id);
      setBusyAction("toggle");
      await adminAPI.patch(`/admin/coupons/${id}/toggle`);
      await loadCoupons();
      showToast("Coupon status updated");
    } catch {
      showToast("Failed to update coupon", "error");
    } finally {
      setBusyCouponId("");
      setBusyAction("");
    }
  };

  const removeCoupon = async (id) => {
    try {
      setBusyCouponId(id);
      setBusyAction("remove");
      await adminAPI.delete(`/admin/coupons/${id}`);
      await loadCoupons();
      showToast("Coupon removed");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to remove coupon", "error");
    } finally {
      setBusyCouponId("");
      setBusyAction("");
    }
  };

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading coupons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-coupons-page">
      {toast.open && (
        <div className={`acp-toast acp-toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <div className="acp-shell">
        <nav className="acp-breadcrumb">
          <button
            type="button"
            className="acp-crumb-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Coupons</span>
        </nav>

        <header className="acp-header">
          <div>
            <p className="acp-kicker">PARIVA Offers Desk</p>
            <h1>Coupon Management</h1>
            <p>Create, monitor, and toggle promotional coupons.</p>
          </div>
          <div className="acp-meta">Total: {coupons.length} coupons</div>
        </header>

        <section className="acp-form-card">
          <h3>Create Coupon</h3>
          <div className="acp-form-grid">
            <input name="code" placeholder="Coupon Code" value={form.code} onChange={handleChange} />

            <SelectDropdown
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              options={[
                { value: "flat", label: "Flat Rs" },
                { value: "percent", label: "Percentage %" },
              ]}
            />

            <input
              name="discountValue"
              placeholder="Discount Value"
              value={form.discountValue}
              onChange={handleChange}
            />

            <input
              name="minOrderValue"
              placeholder="Min Order Value"
              value={form.minOrderValue}
              onChange={handleChange}
            />

            <DatePicker
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
            />

            <label className="acp-checkbox ui-check-label">
              <input
                type="checkbox"
                name="firstOrderOnly"
                className="ui-check-input"
                checked={form.firstOrderOnly}
                onChange={handleChange}
              />
              <span className="ui-check-box" aria-hidden="true"></span>
              <span className="ui-check-text">Only for first order welcome coupon</span>
            </label>

            <button type="button" className="acp-btn acp-btn-primary" onClick={createCoupon} disabled={creating}>
              {creating ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </section>

        <section className="acp-table-card">
          <div className="acp-table-wrap">
            <table className="acp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Min Order</th>
                  <th>Eligibility</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const busy = busyCouponId === c._id;
                  return (
                    <tr key={c._id}>
                      <td className="acp-code-cell">{c.code}</td>
                      <td>{c.discountType}</td>
                      <td>
                        {c.discountType === "percent" ? `${c.discountValue}%` : `Rs ${c.discountValue}`}
                      </td>
                      <td>Rs {c.minOrderValue}</td>
                      <td>{c.firstOrderOnly ? "First Order Only" : "All Orders"}</td>
                      <td>
                        {c.expiryDate && new Date(c.expiryDate).getFullYear() > 1970
                          ? new Date(c.expiryDate).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>
                        <span className={`acp-status-pill ${c.isActive ? "active" : "disabled"}`}>
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div className="acp-action-group">
                          <button
                            type="button"
                            className={`acp-btn ${c.isActive ? "danger" : "success"}`}
                            onClick={() => toggleStatus(c._id)}
                            disabled={busy}
                          >
                            {busy && busyAction === "toggle" ? "Updating..." : c.isActive ? "Disable" : "Enable"}
                          </button>
                          {!c.isActive && (
                            <button
                              type="button"
                              className="acp-btn remove"
                              onClick={() => removeCoupon(c._id)}
                              disabled={busy}
                            >
                              {busy && busyAction === "remove" ? "Removing..." : "Remove"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {coupons.length === 0 && <div className="acp-empty">No coupons found</div>}
        </section>
      </div>
    </div>
  );
}

export default AdminCoupons;
