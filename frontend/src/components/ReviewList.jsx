import { useState } from "react";
import StarRating from "./StarRating.jsx";
import "./ReviewList.css";

export default function ReviewList({ reviews, loading = false }) {
  const [helpfulMap, setHelpfulMap] = useState({});
  const [reportedMap, setReportedMap] = useState({});

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (loading) {
    return <div className="review-list-loading">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <div className="review-list-empty-icon">Star</div>
        <h3>No reviews yet</h3>
        <p>Be the first to share your experience with this product.</p>
      </div>
    );
  }

  return (
    <section className="review-list">
      <div className="review-list-head">
        <div>
          <p className="review-list-kicker">Real Customer Feedback</p>
          <h3>Customer Reviews ({reviews.length})</h3>
        </div>
      </div>

      <div className="review-list-grid">
        {reviews.map((review) => {
          const helpfulCount = review.helpful || 0;
          const liked = Boolean(helpfulMap[review._id]);
          const reported = Boolean(reportedMap[review._id]);

          return (
            <article key={review._id} className="review-card">
              <div className="review-card-head">
                <div className="review-author">
                  <div className="review-avatar">
                    {review.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <strong>{review.userId?.name || "Anonymous User"}</strong>
                    <span>{review.userId?.email || "Verified customer"}</span>
                  </div>
                </div>

                <div className="review-meta">
                  <span>{formatDate(review.createdAt)}</span>
                  <StarRating value={review.rating} readonly={true} size="small" />
                </div>
              </div>

              <div className="review-comment">{review.comment}</div>

              <div className="review-actions">
                <button
                  type="button"
                  className={`review-action-btn ${liked ? "active" : ""}`}
                  onClick={() =>
                    setHelpfulMap((prev) => ({
                      ...prev,
                      [review._id]: !prev[review._id],
                    }))
                  }
                >
                  Helpful ({liked ? helpfulCount + 1 : helpfulCount})
                </button>

                <button
                  type="button"
                  className={`review-action-btn report ${reported ? "reported" : ""}`}
                  onClick={() =>
                    setReportedMap((prev) => ({
                      ...prev,
                      [review._id]: !prev[review._id],
                    }))
                  }
                >
                  {reported ? "Reported" : "Report"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
