import { useState, useEffect } from "react";
import adminAPI from "../../services/adminApi";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState({
    rating: '',
    productId: ''
  });

  // Fetch reviews
  const fetchReviews = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      
      // Build query string manually
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', 20);
      
      if (filters.rating) queryParams.append('rating', filters.rating);
      if (filters.productId) queryParams.append('productId', filters.productId);
      
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

  // Initial load
  useEffect(() => {
    fetchReviews();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(page, filter);
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    
    try {
      const response = await adminAPI.delete(`/reviews/${reviewId}`);
      
      if (response.data.success) {
        // Refresh reviews list
        fetchReviews(currentPage, filter);
        alert("Review deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review");
    }
  };

  // Filter reviews based on current filter
  const filteredReviews = reviews.filter(review => {
    const matchesRating = !filter.rating || review.rating === parseInt(filter.rating);
    const productId = review.productId?._id;
    const matchesProduct = !filter.productId || (productId && productId.toLowerCase().includes(filter.productId.toLowerCase()));
    return matchesRating && matchesProduct;
  });

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "2rem", color: "#333" }}>Review Management</h2>

      {/* Filters */}
      <div style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        marginBottom: "2rem"
      }}>
        <h3 style={{ marginBottom: "1rem", color: "#333" }}>Filters</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" }}>
              Rating:
            </label>
            <select
              name="rating"
              value={filter.rating}
              onChange={handleFilterChange}
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#374151" }}>
              Product ID:
            </label>
            <input
              type="text"
              name="productId"
              value={filter.productId}
              onChange={handleFilterChange}
              placeholder="Enter product ID"
              style={{
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                width: "200px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem", 
            color: "#666" 
          }}>
            Loading reviews...
          </div>
        ) : (
          <>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              backgroundColor: "#fff"
            }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>User</th>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>Product</th>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>Rating</th>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>Comment</th>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>Date</th>
                  <th style={{ 
                    padding: "12px", 
                    textAlign: "left", 
                    borderBottom: "2px solid #dee2e6",
                    fontWeight: "600",
                    color: "#374151"
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: "#f8f9fa",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#666",
                          fontSize: "12px"
                        }}>
                          {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#333", marginBottom: "2px" }}>
                            {review.userId?.name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {review.userId?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: "600", color: "#333", marginBottom: "4px" }}>
                        {review.productId?.name || 'N/A'}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        ID: {review.productId?._id || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ color: "#ffc107", fontSize: "16px" }}>
                        {getRatingStars(review.rating)}
                      </span>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        {review.rating}/5
                      </div>
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      maxWidth: "300px",
                      wordBreak: "break-word",
                      lineHeight: "1.4"
                    }}>
                      {review.comment}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatDate(review.createdAt)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#c82333";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#dc3545";
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "2rem",
                padding: "1rem"
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: currentPage === 1 ? "#e9ecef" : "#007bff",
                    color: currentPage === 1 ? "#6c757d" : "#fff",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  Previous
                </button>
                
                <span style={{ 
                  fontSize: "14px", 
                  color: "#666",
                  fontWeight: "500"
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: currentPage === totalPages ? "#e9ecef" : "#007bff",
                    color: currentPage === totalPages ? "#6c757d" : "#fff",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
