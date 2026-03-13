import { useEffect, useState } from "react";
import API from "../../services/api";

function MyFeedback() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageSrc = (image) => (image ? `http://localhost:5000/uploads/${image}` : null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await API.get("/reviews/my");
        setReviews(res.data?.data || []);
      } catch (error) {
        console.error("Failed to load my reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  if (loading) {
    return <div style={{ padding: 24, color: "#64748b" }}>Loading feedback...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          border: "1px solid #dbe4ee",
          borderRadius: 24,
          background: "linear-gradient(135deg, #ffffff 0%, #fffaf1 52%, #f2f8fb 100%)",
          boxShadow: "0 10px 28px rgba(29, 49, 74, 0.08)",
          padding: 24,
          marginBottom: 18,
        }}
      >
        <p style={{ margin: 0, color: "#b48313", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, fontSize: 12 }}>
          Review History
        </p>
        <h1 style={{ margin: "8px 0 0", color: "#233a55", fontSize: "2.2rem" }}>My Feedback</h1>
        <p style={{ margin: "12px 0 0", color: "#5e7086" }}>
          Track every review you have submitted for delivered orders.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div
          style={{
            border: "1px solid #dbe4ee",
            borderRadius: 22,
            background: "#fff",
            padding: 24,
            color: "#64748b",
          }}
        >
          You have not submitted any feedback yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {reviews.map((review) => (
            <article
              key={review._id}
              style={{
                border: "1px solid #e5edf6",
                borderRadius: 22,
                background: "linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%)",
                padding: 20,
                boxShadow: "0 8px 22px rgba(29, 49, 74, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flex: 1, minWidth: 0 }}>
                  {review.productId?.image ? (
                    <img
                      src={getImageSrc(review.productId.image)}
                      alt={review.productId?.name || "Reviewed Product"}
                      style={{
                        width: 88,
                        height: 88,
                        borderRadius: 18,
                        objectFit: "cover",
                        flexShrink: 0,
                        border: "1px solid #e5edf6",
                      }}
                    />
                  ) : null}

                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, color: "#29425f", fontSize: "1.2rem" }}>
                      {review.productId?.name || "Reviewed Product"}
                    </h2>
                    <p style={{ margin: "8px 0 0", color: "#6d7b8c" }}>
                      {review.productId?.category || "Jewellery"} | Order status:{" "}
                      {review.orderId?.orderStatus || "Completed"}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "#f4f7fb",
                    color: "#36506f",
                    fontWeight: 700,
                  }}
                >
                  {"★".repeat(review.rating)} <span style={{ color: "#8b98a8" }}>({review.rating}/5)</span>
                </div>
              </div>

              <p
                style={{
                  margin: "16px 0 0",
                  padding: 16,
                  borderRadius: 16,
                  background: "#f8fbfe",
                  border: "1px solid #e5edf6",
                  color: "#43566e",
                  lineHeight: 1.65,
                }}
              >
                {review.comment}
              </p>

              <p style={{ margin: "14px 0 0", color: "#7b8898", fontSize: 14 }}>
                Submitted on {new Date(review.createdAt).toLocaleDateString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyFeedback;
