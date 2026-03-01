import React, { useState } from 'react';
import StarRating from './StarRating.jsx';
import api from '../services/api.js';

const ReviewForm = ({ 
  productId, 
  orderId, 
  onReviewSubmitted, 
  onCancel 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    if (comment.length > 1000) {
      setError('Review comment cannot exceed 1000 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reviews', {
        productId,
        orderId,
        rating,
        comment: comment.trim()
      });

      if (response.data.success) {
        setSuccess('Review submitted successfully!');
        setRating(0);
        setComment('');
        
        // Notify parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.data);
        }

        // Auto close after success
        setTimeout(() => {
          if (onCancel) onCancel();
        }, 2000);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit review. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#fff',
      maxWidth: '600px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
        Write a Review
      </h3>

      {/* Success Message */}
      {success && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Rating <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <StarRating 
            value={rating} 
            onChange={setRating} 
            size="large"
          />
          {rating > 0 && (
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '14px', 
              color: '#666' 
            }}>
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}>
            Review <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={1000}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'right',
            marginTop: '4px'
          }}>
            {comment.length}/1000 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              color: '#333',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: '#fff',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReviewForm;
