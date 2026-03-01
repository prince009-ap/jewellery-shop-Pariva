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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { background: "#16a34a", color: "white" };
      case "rejected":
        return { background: "#dc2626", color: "white" };
      case "pending":
      default:
        return { background: "#f59e0b", color: "white" };
    }
  };

  if (loading) return <h3 style={{ padding: 40 }}>Loading...</h3>;

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "auto" }}>
      <h2 style={{ marginBottom: 30 }}>My Custom Designs</h2>

      {list.length === 0 && <p>No custom requests yet.</p>}

      {list.map((d) => (
        <div
          key={d._id}
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 20,
            marginBottom: 30,
            background: "white",
            boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <h3>
              {d.jewelleryType}
            </h3>

            <span
              style={{
                padding: "6px 14px",
                borderRadius: 30,
                fontSize: 12,
                fontWeight: 600,
                ...getStatusStyle(d.status),
              }}
            >
              {d.status}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 20 }}>
            
            {/* IMAGE */}
            <div>
              {d.referenceImage ? (
                <img
                  src={`http://localhost:5000/uploads/${d.referenceImage}`}
                  alt="custom"
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 200,
                    background: "#f3f4f6",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                  }}
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
                <div style={{ marginTop: 10 }}>
                  <strong>Description:</strong>
                  <p style={{ color: "#555" }}>{d.description}</p>
                </div>
              )}

              {/* ADMIN RESPONSE */}
              {d.status === "approved" && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 15,
                    background: "#f0fdf4",
                    borderRadius: 10,
                  }}
                >
                  <p><strong>Final Weight:</strong> {d.finalWeight} g</p>
                  <p><strong>Final Price:</strong> ₹{d.finalPrice}</p>
                </div>
              )}

              {d.status === "rejected" && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 15,
                    background: "#fef2f2",
                    borderRadius: 10,
                    color: "#dc2626",
                  }}
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