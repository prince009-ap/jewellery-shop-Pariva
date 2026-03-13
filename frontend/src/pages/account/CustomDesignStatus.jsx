import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function MyCustomDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/custom-design");
        setDesigns(res.data);
      } catch (err) {
        console.error(err);
        setFeedback({ type: "error", text: "Unable to load your custom requests right now." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalizedDesigns = useMemo(
    () =>
      designs.map((design) => ({
        ...design,
        imageSrc: getImageSrc(design.referenceImage),
        metalName: design.metalType || design.metal || "Not specified",
        stoneName: design.stone || design.stones?.filter(Boolean)?.join(", ") || "Not specified",
        budgetLabel: getBudgetLabel(design),
        sizeLabel:
          design.ringSize ||
          design.necklaceLength ||
          design.bangleSize ||
          design.size ||
          "Not specified",
      })),
    [designs]
  );

  const removeDesign = async (id) => {
    try {
      setRemovingId(id);
      setFeedback(null);
      await API.delete(`/custom-design/${id}`);
      setDesigns((prev) => prev.filter((design) => design._id !== id));
      setFeedback({ type: "success", text: "Custom request removed." });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err.response?.data?.message || "Failed to remove request.",
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: 30 }}>Loading your designs...</p>;
  }

  return (
    <div className="my-custom-shell">
      <div className="my-custom-breadcrumb">
        <Link to="/home">Home</Link>
        <span>/</span>
        <span>My Custom Requests</span>
      </div>

      <section className="my-custom-hero">
        <div className="my-custom-hero-copy">
          <h2>My Custom Jewellery Requests</h2>
          <p>Track every request, see the uploaded reference image, and continue checkout once approved.</p>
        </div>
        <Link to="/custom-design" className="my-custom-hero-link">
          Create New Request
        </Link>
      </section>

      {feedback && (
        <div className={`my-custom-feedback my-custom-feedback-${feedback.type}`}>
          {feedback.text}
        </div>
      )}

      {normalizedDesigns.length === 0 ? (
        <section className="my-custom-empty">
          <p>No custom requests yet.</p>
          <Link to="/custom-design" className="my-custom-hero-link">
            Start Custom Design
          </Link>
        </section>
      ) : (
        normalizedDesigns.map((design) => (
          <article key={design._id} className="my-custom-card-v2">
            <div className="my-custom-card-top">
              <div>
                <h3>{design.jewelleryType || "Custom Jewellery"}</h3>
                <p>{design.purpose || "Personal request"}</p>
              </div>
              <strong
                style={{
                  color:
                    design.status === "approved"
                      ? "green"
                      : design.status === "rejected"
                      ? "red"
                      : "orange",
                }}
              >
                {(design.status || "pending").toUpperCase()}
              </strong>
            </div>

            <div className="my-custom-card-layout">
              <div className="my-custom-image-panel">
                {design.imageSrc ? (
                  <img
                    src={design.imageSrc}
                    alt={design.jewelleryType || "Custom design"}
                    className="my-custom-reference-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.add("show");
                    }}
                  />
                ) : null}
                <div className={`my-custom-image-fallback ${design.imageSrc ? "" : "show"}`}>
                  Reference image not available
                </div>
              </div>

              <div className="my-custom-info-panel">
                <div className="my-custom-meta-grid">
                  <div><b>Budget:</b> {design.budgetLabel}</div>
                  <div><b>Metal:</b> {design.metalName}</div>
                  <div><b>Purity:</b> {design.purity || "Not specified"}</div>
                  <div><b>Stone:</b> {design.stoneName}</div>
                  <div><b>Weight:</b> {design.approxWeight ? `${design.approxWeight} gm` : "Not specified"}</div>
                  <div><b>Size:</b> {design.sizeLabel}</div>
                  <div><b>Finish:</b> {design.finish || "Not specified"}</div>
                  <div><b>Occasion:</b> {design.occasion || "Not specified"}</div>
                </div>

                {design.description && (
                  <div className="my-custom-description-box">
                    <b>Description:</b>
                    <p>{design.description}</p>
                  </div>
                )}

                {design.status === "approved" && (
                  <div className="my-custom-response my-custom-approved">
                    <div className="my-custom-price-grid">
                      <div><b>Final Weight:</b> {design.finalWeight || "-"} gm</div>
                      <div><b>Making Charge:</b> Rs {design.makingCharge || 0}</div>
                      <div><b>Total Price:</b> Rs {design.finalPrice || 0}</div>
                      <div><b>Delivery:</b> {design.deliveryDays ? `${design.deliveryDays} days` : "To be shared"}</div>
                    </div>

                    <button
                      className="my-custom-action-btn"
                      onClick={() =>
                        navigate("/checkout", {
                          state: {
                            source: "custom",
                            customDesign: {
                              id: design._id,
                              name: `Custom ${design.jewelleryType}`,
                              price: design.finalPrice,
                              referenceImage: design.referenceImage,
                            },
                          },
                        })
                      }
                    >
                      Checkout
                    </button>
                  </div>
                )}

                {design.status === "rejected" && (
                  <div className="my-custom-response my-custom-rejected">
                    <b>Rejection Reason:</b>
                    <p>{design.rejectReason || "No reason shared yet."}</p>
                  </div>
                )}

                <div className="my-custom-card-footer">
                  <p>Submitted on: {new Date(design.createdAt).toLocaleDateString()}</p>

                  {(design.status === "pending" || design.status === "rejected") && (
                    <button
                      className="my-custom-remove-btn"
                      onClick={() => removeDesign(design._id)}
                      disabled={removingId === design._id}
                    >
                      {removingId === design._id ? "Removing..." : "Remove Request"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function getImageSrc(image) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `http://localhost:5000/uploads/${image}`;
}

function getBudgetLabel(design) {
  if (design.budgetTier?.label) return design.budgetTier.label;
  if (design.budgetMin || design.budgetMax) {
    return `Rs ${design.budgetMin || 0} - Rs ${design.budgetMax || 0}`;
  }
  return "Not specified";
}
