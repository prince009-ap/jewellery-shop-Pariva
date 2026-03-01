import React, { useState } from 'react';

const StarRating = ({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'medium',
  showValue = false 
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  
  const starSizes = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };
  
  const starSize = starSizes[size] || starSizes.medium;
  
  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };
  
  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };
  
  const renderStar = (index) => {
    const starValue = index + 1;
    const filled = hoverValue > 0 ? starValue <= hoverValue : starValue <= value;
    
    return (
      <span
        key={index}
        style={{
          fontSize: starSize,
          color: filled ? '#ffc107' : '#e4e5e7',
          cursor: readonly ? 'default' : 'pointer',
          transition: 'color 0.2s ease',
          marginRight: '2px'
        }}
        onClick={() => handleClick(starValue)}
        onMouseEnter={() => handleMouseEnter(starValue)}
        onMouseLeave={handleMouseLeave}
      >
        ★
      </span>
    );
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {showValue && (
        <span style={{ 
          fontSize: '14px', 
          color: '#666',
          marginLeft: '4px'
        }}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
