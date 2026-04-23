import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import "./BannerManager.css";
import "./ReviewManagement.css";

const ReviewManagement = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState({
    rating: "",
    productId: "",
    sortBy: "latest",
  });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReviews = async (page = 1, filters = {}) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("limit", 20);

      if (filters.rating) queryParams.append("rating", filters.rating);
      if (filters.productId) queryParams.append("productId", filters.productId);

      const response = await adminAPI.get(`/reviews/admin/all?${queryParams}`);

      if (response.data.success) {
        setReviews(response.data.data.reviews);
        setTotalPages(response.data.data.pagination.totalPages);
        setCurrentPage(response.data.data.pagination.currentPage);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const nextFilter = { ...filter, [name]: value };
    setFilter(nextFilter);
    setCurrentPage(1);
    fetchReviews(1, nextFilter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(page, filter);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    try {
      const response = await adminAPI.delete(`/reviews/${pendingDelete._id}`);
      if (response.data.success) {
        fetchReviews(currentPage, filter);
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setDeleteLoading(false);
      setPendingDelete(null);
    }
  };

  const filteredReviews = useMemo(() => {
    const list = reviews.filter((review) => {
      const matchesRating = !filter.rating || review.rating === Number.parseInt(filter.rating, 10);
      const productId = review.productId?._id;
      const matchesProduct =
        !filter.productId || (productId && productId.toLowerCase().includes(filter.productId.toLowerCase()));

      return matchesRating && matchesProduct;
    });

    switch (filter.sortBy) {
      case "oldest":
        list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "rating_high":
        list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case "rating_low":
        list.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
        break;
      case "latest":
      default:
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return list;
  }, [filter.productId, filter.rating, filter.sortBy, reviews]);

  const getRatingStars = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <div className="banner-manager-page">
        <div className="review-manager-shell">
          <nav className="banner-breadcrumb">
            <button
              type="button"
              className="crumb-home-btn"
              onClick={() => navigate("/admin/dashboard", { replace: true })}
            >
              Home
            </button>
            <span>&gt;</span>
            <span>Reviews</span>
          </nav>

          <header className="banner-manager-header">
            <div>
              <p className="banner-kicker">Admin Panel</p>
              <h1>Review Management</h1>
              <p>View and moderate customer feedback.</p>
            </div>
          </header>

          <section className="banner-table-card review-filter-card">
            <h3 className="review-filter-title">Filters</h3>
            <div className="review-filter-row">
              <div className="review-sort-wrap">
                <label htmlFor="review-sort">Sort By</label>
                <SelectDropdown
                  id="review-sort"
                  name="sortBy"
                  value={filter.sortBy}
                  onChange={handleFilterChange}
                  options={[
                    { value: "latest", label: "Latest Reviews" },
                    { value: "oldest", label: "Oldest Reviews" },
                    { value: "rating_high", label: "Rating High-Low" },
                    { value: "rating_low", label: "Rating Low-High" },
                  ]}
                />
              </div>

              <div className="review-sort-wrap">
                <label htmlFor="review-rating">Rating</label>
                <SelectDropdown
                  id="review-rating"
                  name="rating"
                  value={filter.rating}
                  onChange={handleFilterChange}
                  options={[
                    { value: "", label: "All Ratings" },
                    { value: "5", label: "5 Stars" },
                    { value: "4", label: "4 Stars" },
                    { value: "3", label: "3 Stars" },
                    { value: "2", label: "2 Stars" },
                    { value: "1", label: "1 Star" },
                  ]}
                  placeholder="All Ratings"
                />
              </div>

              <div className="review-input-wrap">
                <label htmlFor="review-product-id">Product ID</label>
                <input
                  id="review-product-id"
                  type="text"
                  name="productId"
                  value={filter.productId}
                  onChange={handleFilterChange}
                  placeholder="Enter product ID"
                />
              </div>
            </div>
          </section>

          <div className="banner-table-card">
            {loading ? (
              <div className="page-loading-overlay review-loading-state">Loading reviews...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="empty-state">
                <p>No reviews found matching the criteria.</p>
              </div>
            ) : (
              <div className="banner-table-wrap">
                <table className="banner-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Product</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review._id}>
                        <td data-label="User">
                          <div className="review-user-cell">
                            <div className="review-user-avatar">
                              {review.userId?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="review-user-name">{review.userId?.name || "Anonymous"}</div>
                              <div className="review-user-email">{review.userId?.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Product">
                          <div className="review-product-cell">
                            <img
                              className="review-product-thumb"
                              src={
                                review.productId?.image
                                  ? `http://localhost:5000/uploads/${review.productId.image}`
                                  : "/images/placeholder.jpg"
                              }
                              alt={review.productId?.name || "Product"}
                            />
                            <div>
                              <div className="review-product-name">{review.productId?.name || "N/A"}</div>
                              <div className="review-product-id-box">
                                ID: {review.productId?._id || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Rating">
                          <span className="review-rating-stars">{getRatingStars(review.rating)}</span>
                          <div className="review-rating-meta">{review.rating}/5</div>
                        </td>
                        <td data-label="Comment" className="review-comment-cell">{review.comment}</td>
                        <td data-label="Date">{formatDate(review.createdAt)}</td>
                        <td data-label="Actions">
                          <button className="banner-pill-btn delete-btn" onClick={() => setPendingDelete(review)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="review-pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="review-page-btn"
                    >
                      Previous
                    </button>

                    <span className="review-page-text">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="review-page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingDelete && (
        <div className="banner-modal-backdrop" role="dialog" aria-modal="true">
          <div className="banner-modal-card">
            <p className="banner-modal-kicker">Confirm Action</p>
            <h3>Delete this review?</h3>
            <p>
              Are you sure you want to permanently remove the review by <strong>{pendingDelete.userId?.name || "Anonymous"}</strong>?
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
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewManagement;
