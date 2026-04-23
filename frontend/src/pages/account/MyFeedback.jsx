import { useEffect, useState } from "react";
import API from "../../services/api";
import "./MyFeedback.css";

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
    return <div className="my-feedback-loading">Loading feedback...</div>;
  }

  return (
    <div className="my-feedback-page">
      <div className="my-feedback-hero">
        <p className="my-feedback-kicker">Review History</p>
        <h1 className="my-feedback-title">My Feedback</h1>
        <p className="my-feedback-subtitle">
          Track every review you have submitted for delivered orders.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="my-feedback-empty">You have not submitted any feedback yet.</div>
      ) : (
        <div className="my-feedback-list">
          {reviews.map((review) => (
            <article key={review._id} className="my-feedback-card">
              <div className="my-feedback-head">
                <div className="my-feedback-product">
                  {review.productId?.image ? (
                    <img
                      src={getImageSrc(review.productId.image)}
                      alt={review.productId?.name || "Reviewed Product"}
                      className="my-feedback-image"
                    />
                  ) : null}

                  <div className="my-feedback-product-copy">
                    <h2 className="my-feedback-product-title">
                      {review.productId?.name || "Reviewed Product"}
                    </h2>
                    <p className="my-feedback-product-meta">
                      {review.productId?.category || "Jewellery"} <span>|</span> Order status:{" "}
                      {review.orderId?.orderStatus || "Completed"}
                    </p>
                  </div>
                </div>

                <div className="my-feedback-rating">
                  {"★".repeat(review.rating)} <span>({review.rating}/5)</span>
                </div>
              </div>

              <p className="my-feedback-comment">{review.comment}</p>

              <p className="my-feedback-date">
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
