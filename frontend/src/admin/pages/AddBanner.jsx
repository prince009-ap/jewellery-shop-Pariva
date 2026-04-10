import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "../../components/common/DatePicker";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import "./AddBanner.css";

export default function AddBanner() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [targetType, setTargetType] = useState("global");
  const [targetValue, setTargetValue] = useState("");
  const [audienceType, setAudienceType] = useState("all");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [desktop, setDesktop] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!desktop) {
      setPreviewUrl("");
      return;
    }

    const objUrl = URL.createObjectURL(desktop);
    setPreviewUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [desktop]);

  const submit = async () => {
    if (submitting) return;

    if (targetType === "category" && !targetValue.trim()) {
      setMessage("Please enter a target category for category-specific banner.");
      return;
    }

    if (!desktop) {
      setMessage("Please choose a banner image before saving.");
      return;
    }

    if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
      setMessage("Campaign start date must be before end date.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("link", link);
    fd.append("targetType", targetType);
    fd.append("targetValue", targetType === "category" ? targetValue.trim().toLowerCase() : "");
    fd.append("audienceType", audienceType);
    fd.append("startAt", startAt);
    fd.append("endAt", endAt);
    fd.append("desktop", desktop);

    try {
      setSubmitting(true);
      setMessage("");
      await adminAPI.post("/admin/banners", fd);
      navigate("/admin/banners", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save banner right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-banner-page">
      <div className="add-banner-shell">
        <nav className="add-banner-breadcrumb">
          <Link to="/admin/dashboard">Home</Link>
          <span>&gt;</span>
          <Link to="/admin/banners">Banners</Link>
          <span>&gt;</span>
          <span>Add</span>
        </nav>

        <header className="add-banner-header">
          <p className="add-banner-kicker">PARIVA Campaign Studio</p>
          <h1>Add Banner</h1>
          <p>Create a banner with category, audience, and campaign dates.</p>
        </header>

        <section className="add-banner-card">
          {message ? <div className="add-banner-message">{message}</div> : null}

          <div className="add-banner-grid">
            <div className="field-group">
              <label>Banner Title</label>
              <input
                placeholder="e.g. Festive Collection"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Redirect Link</label>
              <input
                placeholder="e.g. /category/necklaces"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Banner Target</label>
              <SelectDropdown
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                options={[
                  { value: "global", label: "Homepage Global" },
                  { value: "category", label: "Specific Category" },
                ]}
                placeholder="Select banner target"
              />
            </div>

            <div className="field-group">
              <label>Target Category</label>
              <input
                placeholder="e.g. rings, bangles, earrings"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                disabled={targetType !== "category"}
              />
            </div>

            <div className="field-group">
              <label>Visible For</label>
              <SelectDropdown
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
                options={[
                  { value: "all", label: "All Users" },
                  { value: "before_first_order", label: "Only Before First Order" },
                ]}
                placeholder="Select audience"
              />
            </div>

            <div className="field-group">
              <label>Campaign Start Date</label>
              <DatePicker value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>

            <div className="field-group">
              <label>Campaign End Date</label>
              <DatePicker value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>

            <div className="field-group field-file">
              <label>Desktop Banner Image</label>
              <div className="ui-file-field">
                <label className={`ui-file-shell ${desktop ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="ui-file-input"
                    onChange={(e) => setDesktop(e.target.files?.[0] || null)}
                  />
                  <span className="ui-file-trigger">{desktop ? "Change Image" : "Choose Image"}</span>
                  <span className="ui-file-copy">
                    <span className="ui-file-name">{desktop?.name || "No image selected yet"}</span>
                    <span className="ui-file-caption">Use a clear desktop banner image for the campaign.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="preview-panel">
            <p>Preview</p>
            {previewUrl ? (
              <img src={previewUrl} alt="Banner preview" />
            ) : (
              <div className="preview-placeholder">No image selected</div>
            )}
          </div>

          <div className="add-banner-actions">
            <Link to="/admin/banners" className="action-link">
              <button type="button" className="add-banner-pill">
                Cancel
              </button>
            </Link>
            <button
              onClick={submit}
              disabled={submitting}
              className={submitting ? "add-banner-pill submit-btn button-loading" : "add-banner-pill submit-btn"}
            >
              {submitting ? "Saving..." : "Save Banner"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
