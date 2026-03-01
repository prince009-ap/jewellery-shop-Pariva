import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option",
  disabled = false,
  required = false,
  label,
  error = "",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div style={{ marginBottom: "1rem" }} className={className}>
      {label && (
        <label style={{
          display: "block",
          marginBottom: "0.5rem",
          fontWeight: "500",
          color: "#374151",
          fontSize: "0.875rem"
        }}>
          {label} {required && <span style={{ color: "#dc2626" }}> *</span>}
        </label>
      )}
      
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{
            width: "100%",
            padding: "0.75rem 2.5rem 0.75rem 1rem",
            border: error ? "1px solid #dc2626" : "1px solid #e5e7eb",
            borderRadius: "8px",
            backgroundColor: disabled ? "#f9fafb" : "white",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            color: selectedOption ? "#1a1a1a" : "#6b7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
            minHeight: "44px"
          }}
        >
          <span style={{ 
            overflow: "hidden", 
            textOverflow: "ellipsis", 
            whiteSpace: "nowrap",
            flex: 1
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span style={{ 
            position: "absolute", 
            right: "1rem", 
            top: "50%", 
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "#6b7280"
          }}>
            {isOpen ? "▲" : "▼"}
          </span>
        </div>

        {isOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderTop: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 50,
            maxHeight: "200px",
            overflow: "auto"
          }}>
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: "0.75rem 1rem",
                color: "#6b7280",
                fontSize: "0.875rem",
                textAlign: "center"
              }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    backgroundColor: option.value === value ? "#fef3c7" : "transparent",
                    color: option.value === value ? "#d4af37" : "#1a1a1a",
                    fontSize: "0.875rem",
                    borderBottom: index === filteredOptions.length - 1 ? "none" : "1px solid #f3f4f6",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = option.value === value ? "#fef3c7" : "transparent";
                  }}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          color: "#dc2626",
          fontSize: "0.75rem",
          marginTop: "0.25rem"
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
