import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: null,
    metal: "",
    occasion: "",
    stock: 50,
    sku: "",
    weight: "",
    purity: "",
    isFeatured: false,
    isTrending: false,
    isRecommended: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: file
      }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validate required image
    if (!form.image) {
      alert("Please select a product image");
      return;
    }

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    try {
      setSubmitting(true);
      const res = await adminAPI.post("/admin/products", data);
      console.log("PRODUCT ADDED:", res.data);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err.response?.data || err.message);
      alert("Product add failed – check console");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      padding: "2rem", 
      maxWidth: "800px", 
      margin: "0 auto",
      background: "#f9fafb",
      minHeight: "100vh"
    }}>
      <div style={{
        background: "white",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{
          margin: "0 0 2rem 0",
          fontSize: "1.875rem",
          fontWeight: "700",
          color: "#111827",
          textAlign: "center"
        }}>Add New Product</h2>

        <form onSubmit={submitHandler}>
          {/* Form Grid Layout */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.5rem",
            marginBottom: "1.5rem"
          }}>
            {/* Product Name */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Product Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Enter product name"
              />
            </div>

            {/* Price */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Price (₹) *
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Enter price"
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  transition: "border-color 0.2s ease"
                }}
              >
                <option value="">Select category</option>
                <option value="Rings">Rings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Earrings">Earrings</option>
                <option value="Bracelets">Bracelets</option>
                <option value="Pendants">Pendants</option>
                <option value="Bangles">Bangles</option>
                <option value="Chains">Chains</option>
              </select>
            </div>

            {/* Metal Type */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Metal Type *
              </label>
              <select
                name="metal"
                value={form.metal}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  transition: "border-color 0.2s ease"
                }}
              >
                <option value="">Select metal</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="White Gold">White Gold</option>
              </select>
            </div>

            {/* Occasion */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Occasion *
              </label>
              <select
                name="occasion"
                value={form.occasion}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  transition: "border-color 0.2s ease"
                }}
              >
                <option value="">Select occasion</option>
                <option value="Wedding">Wedding</option>
                <option value="Daily">Daily Wear</option>
                <option value="Party">Party</option>
                <option value="Festive">Festive</option>
                <option value="Office">Office</option>
                <option value="Casual">Casual</option>
              </select>
            </div>

            {/* Stock Quantity */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Stock Quantity *
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                min="1"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Enter stock quantity"
              />
            </div>

            {/* SKU */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                SKU *
              </label>
              <input
                name="sku"
                type="text"
                value={form.sku}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Enter product SKU"
              />
            </div>

            {/* Weight */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Weight (grams) *
              </label>
              <input
                name="weight"
                type="number"
                value={form.weight}
                onChange={handleChange}
                required
                min="0.1"
                step="0.1"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.2s ease"
                }}
                placeholder="Enter weight in grams"
              />
            </div>

            {/* Purity */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Purity *
              </label>
              <select
                name="purity"
                value={form.purity}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  transition: "border-color 0.2s ease"
                }}
              >
                <option value="">Select purity</option>
                <option value="24K">24K (99.9%)</option>
                <option value="22K">22K (91.6%)</option>
                <option value="18K">18K (75%)</option>
                <option value="14K">14K (58.5%)</option>
                <option value="925">925 Sterling Silver</option>
                <option value="950">950 Silver</option>
                <option value="999">999 Fine Silver</option>
                <option value="950">950 Platinum</option>
                <option value="900">900 Platinum</option>
              </select>
            </div>

            {/* Image Upload */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                Product Image *
                <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>(Required)</span>
              </label>
              <div style={{
                border: `2px dashed ${form.image ? "#10b981" : "#d1d5db"}`,
                borderRadius: "8px",
                padding: "2rem",
                textAlign: "center",
                backgroundColor: form.image ? "#f0fdf4" : "#f9fafb",
                transition: "border-color 0.2s ease"
              }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "inline-block",
                    padding: "0.75rem 1.5rem",
                    backgroundColor: form.image ? "#10b981" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  {form.image ? "Change Image" : "Choose Image"}
                </button>
                {form.image && (
                  <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#059669" }}>
                    Selected: {form.image.name}
                  </div>
                )}
                {form.image && (
                  <div style={{ marginTop: "1rem" }}>
                    <img 
                      src={URL.createObjectURL(form.image)} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: "200px", 
                        maxHeight: "200px", 
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb"
                      }} 
                    />
                  </div>
                )}
                {!form.image && (
                  <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                    Please select an image for the product
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checkboxes Section */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px"
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "#374151"
            }}>
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                style={{
                  marginRight: "0.5rem",
                  width: "1rem",
                  height: "1rem"
                }}
              />
              Featured Product
            </label>

            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "#374151"
            }}>
              <input
                type="checkbox"
                name="isTrending"
                checked={form.isTrending}
                onChange={handleChange}
                style={{
                  marginRight: "0.5rem",
                  width: "1rem",
                  height: "1rem"
                }}
              />
              Trending Product
            </label>

            <label style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "#374151"
            }}>
              <input
                type="checkbox"
                name="isRecommended"
                checked={form.isRecommended}
                onChange={handleChange}
                style={{
                  marginRight: "0.5rem",
                  width: "1rem",
                  height: "1rem"
                }}
              />
              Recommended
            </label>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              disabled={submitting}
              className={submitting ? 'button-loading' : ''}
              style={{
                padding: "1rem 2rem",
                backgroundColor: submitting ? "#6b7280" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
                minWidth: "200px",
                opacity: submitting ? 0.8 : 1
              }}
            >
              {submitting ? (
                <span className="button-loading-content">
                  <span className="loading-spinner-small"></span>
                  Adding Product...
                </span>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
