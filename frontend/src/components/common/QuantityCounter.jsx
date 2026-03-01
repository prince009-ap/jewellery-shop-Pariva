import React, { useState } from 'react';

export default function QuantityCounter({ 
  productId, 
  initialQuantity = 0, 
  onQuantityChange,
  size = 'small',
  disabled = false 
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);

  const handleIncrease = async () => {
    if (loading || disabled) return;
    
    setLoading(true);
    try {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      await onQuantityChange(productId, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(quantity);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrease = async () => {
    if (loading || disabled || quantity <= 0) return;
    
    setLoading(true);
    try {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      await onQuantityChange(productId, newQuantity);
    } catch (error) {
      // Revert on error
      setQuantity(quantity);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectChange = async (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0 && !loading && !disabled) {
      setLoading(true);
      try {
        setQuantity(value);
        await onQuantityChange(productId, value);
      } catch (error) {
        // Revert on error
        setQuantity(quantity);
      } finally {
        setLoading(false);
      }
    }
  };

  if (quantity === 0) {
    // Show "Add to Cart" button when quantity is 0
    return (
      <button
        className={`pill-button ${size === 'small' ? 'pill-small' : ''}`}
        onClick={handleIncrease}
        disabled={disabled || loading}
        style={{
          padding: size === 'small' ? '0.5rem 1rem' : '0.75rem 1.5rem',
          fontSize: size === 'small' ? '0.875rem' : '1rem',
          fontWeight: '500',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: disabled || loading ? '#9ca3af' : '#d4af37',
          color: 'white',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.8 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Adding...
          </>
        ) : (
          'Add to Cart'
        )}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    );
  }

  // Show quantity counter when quantity > 0
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: size === 'small' ? '0.25rem' : '0.5rem',
      opacity: loading ? 0.7 : 1
    }}>
      <button
        onClick={handleDecrease}
        disabled={disabled || loading || quantity <= 0}
        style={{
          width: size === 'small' ? '24px' : '32px',
          height: size === 'small' ? '24px' : '32px',
          border: 'none',
          backgroundColor: 'transparent',
          color: quantity <= 0 || disabled || loading ? '#9ca3af' : '#374151',
          cursor: quantity <= 0 || disabled || loading ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'small' ? '16px' : '18px',
          fontWeight: 'bold'
        }}
      >
        {loading && quantity > 0 ? (
          <div style={{
            width: '12px',
            height: '12px',
            border: '1.5px solid #f3f4f6',
            borderTop: '1.5px solid #d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          '−'
        )}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </button>
      
      <input
        type="number"
        value={quantity}
        onChange={handleDirectChange}
        disabled={disabled || loading}
        min="0"
        style={{
          width: size === 'small' ? '40px' : '60px',
          height: size === 'small' ? '24px' : '32px',
          border: 'none',
          textAlign: 'center',
          fontSize: size === 'small' ? '12px' : '14px',
          fontWeight: '500',
          backgroundColor: 'transparent',
          color: '#111827',
          opacity: loading ? 0.6 : 1
        }}
      />
      
      <button
        onClick={handleIncrease}
        disabled={disabled || loading}
        style={{
          width: size === 'small' ? '24px' : '32px',
          height: size === 'small' ? '24px' : '32px',
          border: 'none',
          backgroundColor: 'transparent',
          color: disabled || loading ? '#9ca3af' : '#374151',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 'small' ? '16px' : '18px',
          fontWeight: 'bold'
        }}
      >
        {loading ? (
          <div style={{
            width: '12px',
            height: '12px',
            border: '1.5px solid #f3f4f6',
            borderTop: '1.5px solid #d4af37',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        ) : (
          '+'
        )}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </button>
    </div>
  );
}
