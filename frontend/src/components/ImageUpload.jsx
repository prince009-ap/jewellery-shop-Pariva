import { API_BASE_URL } from "../services/api";
import React, { useState, useRef } from "react";
import { getUserToken } from "../utils/authStorage";
import "./ImageUpload.css";

const ImageUpload = ({ onUpload, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUpload(data.imageUrl);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button
        type="button"
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "📤" : "📎"}
      </button>
    </div>
  );
};

export default ImageUpload;
