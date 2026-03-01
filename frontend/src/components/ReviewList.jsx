import React from 'react';
import StarRating from './StarRating.jsx';

const ReviewList = ({ reviews, loading = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666'
      }}>
        Loading reviews...
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
        <p style={{ margin: '0', fontSize: '16px' }}>
          No reviews yet
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#666' }}>
          Be the first to share your experience with this product!
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333',
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Customer Reviews ({reviews.length})
      </h3>
      
      {reviews.map((review) => (
        <div 
          key={review._id}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {/* Review Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '16px',
                  marginBottom: '2px'
                }}>
                  {review.userId?.name || 'Anonymous User'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {review.userId?.email || ''}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                {formatDate(review.createdAt)}
              </div>
              <StarRating 
                value={review.rating} 
                readonly={true} 
                size="small"
              />
            </div>
          </div>

          {/* Review Comment */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '6px',
            borderLeft: '3px solid #007bff',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#333'
          }}>
            {review.comment}
          </div>

          {/* Review Actions */}
          <div style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <button
              style={{
                padding: '6px 12px',
                border: '1px solid #007bff',
                backgroundColor: '#fff',
                color: '#007bff',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#007bff';
              }}
            >
              👍 Helpful ({review.helpful || 0})
            </button>
            <button
              style={{
                padding: '6px 12px',
                border: '1px solid #dc3545',
                backgroundColor: '#fff',
                color: '#dc3545',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.color = '#dc3545';
              }}
            >
              🚩 Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
