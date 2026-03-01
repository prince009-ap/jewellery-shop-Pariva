import { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function MyCustomDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/custom-design");
        setDesigns(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeDesign = async (id) => {
    if (!window.confirm("Remove this custom request?")) return;

    try {
      await API.delete(`/custom-design/${id}`);
      setDesigns(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove");
    }
  };

  if (loading) return <p style={{ padding: 30 }}>Loading your designs...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2>My Custom Jewellery Requests</h2>

      {designs.length === 0 && <p>No custom requests yet.</p>}

      {designs.map(d => (
        <div
          key={d._id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            marginBottom: 25,
            background: "#fff"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{d.jewelleryType}</h3>
            <strong
              style={{
                color:
                  d.status === "approved"
                    ? "green"
                    : d.status === "rejected"
                    ? "red"
                    : "orange"
              }}
            >
              {(d.status || "pending").toUpperCase()}
            </strong>
          </div>

          {/* Budget + Purpose */}
          <p><b>Purpose:</b> {d.purpose}</p>
          {d.budgetTier && (
            <p><b>Budget:</b> {d.budgetTier.label}</p>
          )}

          {/* Basic Details */}
          <p><b>Metal:</b> {d.metal}</p>
          <p><b>Purity:</b> {d.purity}</p>
          <p><b>Stone:</b> {d.stone}</p>
          <p><b>Weight:</b> {d.approxWeight} gm</p>
          <p><b>Finish:</b> {d.finish}</p>
          <p><b>Occasion:</b> {d.occasion}</p>

          {/* Dynamic Size */}
          {d.ringSize && <p><b>Ring Size:</b> {d.ringSize}</p>}
          {d.necklaceLength && <p><b>Necklace Length:</b> {d.necklaceLength}</p>}
          {d.bangleSize && <p><b>Bangle Size:</b> {d.bangleSize}</p>}

          {/* Description */}
          {d.description && (
            <p><b>Description:</b><br />{d.description}</p>
          )}

          {/* Image */}
          {d.referenceImage && (
            <div style={{ marginTop: 10 }}>
              <p><b>Reference Image:</b></p>
              <img
                src={`http://localhost:5000/uploads/${d.referenceImage}`}
                alt="reference"
                style={{
                  width: 200,
                  borderRadius: 10,
                  border: "1px solid #ccc"
                }}
                onError={(e) => {
                  console.log("Image failed:", d.referenceImage);
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Approved Section */}
          {d.status === "approved" && (
            <div style={{ marginTop: 15, color: "green" }}>
              <p><b>Final Weight:</b> {d.finalWeight} gm</p>
              <p><b>Making Charge:</b> ₹{d.makingCharge}</p>
              <p><b>Total Price:</b> ₹{d.finalPrice}</p>

              <button
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      source: "custom",
                      customDesign: {
                        id: d._id,
                        name: `Custom ${d.jewelleryType}`,
                        price: d.finalPrice,
                        referenceImage: d.referenceImage
                      }
                    }
                  })
                }
                style={{
                  marginTop: 10,
                  background: "#d4af37",
                  color: "#fff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Checkout
              </button>
            </div>
          )}

          {/* Rejected */}
          {d.status === "rejected" && (
            <div style={{ marginTop: 15, color: "red" }}>
              <p><b>Rejection Reason:</b> {d.rejectReason}</p>
            </div>
          )}

          {/* Remove Button */}
          {(d.status === "pending" || d.status === "rejected") && (
            <button
              style={{
                marginTop: 10,
                background: "#ff4d4d",
                color: "#fff",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer"
              }}
              onClick={() => removeDesign(d._id)}
            >
              Remove Request
            </button>
          )}

          <p style={{ marginTop: 10, fontSize: 12, color: "#777" }}>
            Submitted on: {new Date(d.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}