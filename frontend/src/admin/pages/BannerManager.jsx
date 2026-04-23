import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import "./BannerManager.css";

export default function BannerManager() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadBanners = async () => {
    try {
      const res = await adminAPI.get("admin/banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Load banners error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const deleteBanner = async (id) => {
    setDeleteLoading(true);
    await adminAPI.delete(`/admin/banners/${id}`);
    setDeleteLoading(false);
    setPendingDelete(null);
    loadBanners();
  };

  const toggleStatus = async (id) => {
    await adminAPI.put(`/admin/banners/${id}/toggle`);
    loadBanners();
  };

  const formatDate = (value) => {
    if (!value) return "Always On";
    return new Date(value).toLocaleDateString("en-IN");
  };

  const getLocalDayStart = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  };

  const getLocalDayEnd = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  };

  const getComputedStatus = (banner) => {
    const now = new Date();
    const startAt = getLocalDayStart(banner.startAt);
    const endAt = getLocalDayEnd(banner.endAt);

    if (!banner.isActive) {
      return { label: "Disabled", className: "inactive" };
    }

    if (startAt && startAt > now) {
      return { label: "Scheduled", className: "scheduled" };
    }

    if (endAt && endAt < now) {
      return { label: "Expired", className: "expired" };
    }

    return { label: "Active", className: "active" };
  };

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading banners...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="banner-manager-page">
      <div className="banner-manager-shell">
        <nav className="banner-breadcrumb">
          <button
            type="button"
            className="crumb-home-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Banners</span>
        </nav>

        <header className="banner-manager-header">
          <div>
            <p className="banner-kicker">PARIVA Campaign Studio</p>
            <h1>Banner Manager</h1>
            <p>Manage homepage, category, first-order, and date-based banners.</p>
          </div>

          <Link to="/admin/banners/add" className="banner-add-link">
            <button className="banner-pill-btn banner-add-btn">Add New Banner</button>
          </Link>
        </header>

        {banners.length === 0 ? (
          <section className="banner-empty-card">
            <h3>No banners added yet</h3>
            <p>Create your first campaign banner to show on homepage slider.</p>
          </section>
        ) : (
          <section className="banner-table-card">
            <div className="banner-table-wrap">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Title</th>
                    <th>Target</th>
                    <th>Audience</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {banners.map((banner) => {
                    const computedStatus = getComputedStatus(banner);

                    return (
                      <tr key={banner._id}>
                        <td data-label="Preview">
                          <div className="banner-preview-wrap">
                            <img
                              src={`http://localhost:5000/uploads/${banner.imageDesktop}`}
                              alt={banner.title || "Banner"}
                              className="banner-preview"
                            />
                          </div>
                        </td>

                        <td data-label="Title" className="banner-title-cell">{banner.title || "-"}</td>

                        <td data-label="Target" className="banner-target-cell">
                          {banner.targetType === "category"
                            ? `Category: ${banner.targetValue || "-"}`
                            : "Homepage Global"}
                        </td>

                        <td data-label="Audience" className="banner-target-cell">
                          {banner.audienceType === "before_first_order"
                            ? "Before First Order"
                            : "All Users"}
                        </td>

                        <td data-label="Schedule" className="banner-target-cell">
                          {formatDate(banner.startAt)} to {formatDate(banner.endAt)}
                        </td>

                        <td data-label="Status">
                          <button
                            className={`banner-pill-btn status-btn ${computedStatus.className}`}
                            onClick={() => toggleStatus(banner._id)}
                          >
                            <span className="status-dot" aria-hidden="true"></span>
                            {computedStatus.label}
                          </button>
                        </td>

                        <td data-label="Actions">
                          <button
                            className="banner-pill-btn delete-btn"
                            onClick={() => setPendingDelete(banner)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {pendingDelete && (
        <div className="banner-modal-backdrop" role="dialog" aria-modal="true">
          <div className="banner-modal-card">
            <p className="banner-modal-kicker">Confirm Action</p>
            <h3>Delete this banner?</h3>
            <p>
              This will permanently remove <strong>{pendingDelete.title || "Untitled Banner"}</strong> from
              homepage banners.
            </p>

            <div className="banner-modal-actions">
              <button
                type="button"
                className="banner-pill-btn modal-cancel-btn"
                onClick={() => setPendingDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="banner-pill-btn modal-delete-btn"
                onClick={() => deleteBanner(pendingDelete._id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
