import { useEffect, useState } from "react";
import API from "../../services/api";

export default function MyCustomRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await API.get("/custom-design/my");
      setList(res.data);
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h3 className="my-custom-requests-loading">Loading...</h3>;

  return (
    <div className="my-custom-requests-container">
      <h2 className="my-custom-requests-title">My Custom Designs</h2>

      {list.length === 0 && <p>No custom requests yet.</p>}

      {list.map((d) => (
        <div
          key={d._id}
          className="my-custom-requests-card"
        >
          {/* HEADER */}
          <div
            className="my-custom-requests-header"
          >
            <h3>
              {d.jewelleryType}
            </h3>

            <span
              className={`my-custom-requests-status status-${d.status?.toLowerCase() || 'pending'}`}
            >
              {d.status}
            </span>
          </div>

          <div className="my-custom-requests-grid">
            
            {/* IMAGE */}
            <div>
              {d.referenceImage ? (
                <img
                  src={`http://localhost:5000/uploads/${d.referenceImage}`}
                  alt="custom"
                  className="my-custom-requests-image"
                />
              ) : (
                <div
                  className="my-custom-requests-no-image"
                >
                  No Image
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div>
              <p><strong>Budget:</strong> {d.budgetTier?.label}</p>
              <p><strong>Purpose:</strong> {d.purpose}</p>

              <p><strong>Metal:</strong> {d.metal} ({d.purity})</p>
              <p><strong>Stone:</strong> {d.stone}</p>
              <p><strong>Weight:</strong> {d.approxWeight} g</p>
              <p><strong>Finish:</strong> {d.finish}</p>
              <p><strong>Occasion:</strong> {d.occasion}</p>

              {d.ringSize && (
                <p><strong>Ring Size:</strong> {d.ringSize}</p>
              )}

              {d.necklaceLength && (
                <p><strong>Necklace Length:</strong> {d.necklaceLength}</p>
              )}

              {d.bangleSize && (
                <p><strong>Bangle Size:</strong> {d.bangleSize}</p>
              )}

              {d.description && (
                <div className="my-custom-requests-description-container">
                  <strong>Description:</strong>
                  <p className="my-custom-requests-description">{d.description}</p>
                </div>
              )}

              {/* ADMIN RESPONSE */}
              {d.status === "approved" && (
                <div
                  className="my-custom-requests-approved-response"
                >
                  <p><strong>Final Weight:</strong> {d.finalWeight} g</p>
                  <p><strong>Final Price:</strong> ₹{d.finalPrice}</p>
                </div>
              )}

              {d.status === "rejected" && (
                <div
                  className="my-custom-requests-rejected-response"
                >
                  <strong>Rejection Reason:</strong>
                  <p>{d.rejectReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}