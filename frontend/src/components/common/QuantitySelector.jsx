// src/components/common/QuantitySelector.js
import React from "react";

function QuantitySelector({ value, onChange, min = 1 }) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrement = () => {
    onChange(value + 1);
  };

  return (
    <div className="qty-selector">
      <button type="button" onClick={handleDecrement} aria-label="Decrease quantity">
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={handleIncrement} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

export default QuantitySelector;