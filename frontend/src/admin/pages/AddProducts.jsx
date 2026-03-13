import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import "./AddProducts.css";

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
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!form.image) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (submitting) return;

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
      navigate("/admin/products", { replace: true });
    } catch (err) {
      console.error("ADD PRODUCT ERROR:", err.response?.data || err.message);
      alert("Product add failed - check console");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-shell">
        <nav className="add-product-breadcrumb">
          <button
            type="button"
            className="crumb-home-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <button
            type="button"
            className="crumb-home-btn"
            onClick={() => navigate("/admin/products", { replace: true })}
          >
            Products
          </button>
          <span>&gt;</span>
          <span>Add</span>
        </nav>

        <header className="add-product-header">
          <p className="add-product-kicker">PARIVA Catalog Studio</p>
          <h1>Add New Product</h1>
          <p>Create and publish a product to your catalog.</p>
        </header>

        <section className="add-product-card">
          <form onSubmit={submitHandler}>
            <div className="add-product-grid">
              <div className="field-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                />
              </div>

              <div className="field-group">
                <label>Price (Rs) *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="Enter price"
                />
              </div>

              <div className="field-group">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleChange} required>
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

              <div className="field-group">
                <label>Metal Type *</label>
                <select name="metal" value={form.metal} onChange={handleChange} required>
                  <option value="">Select metal</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="White Gold">White Gold</option>
                </select>
              </div>

              <div className="field-group">
                <label>Occasion *</label>
                <select name="occasion" value={form.occasion} onChange={handleChange} required>
                  <option value="">Select occasion</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Daily">Daily Wear</option>
                  <option value="Party">Party</option>
                  <option value="Festive">Festive</option>
                  <option value="Office">Office</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>

              <div className="field-group">
                <label>Stock Quantity *</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="field-group">
                <label>SKU *</label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                  placeholder="Enter product SKU"
                />
              </div>

              <div className="field-group">
                <label>Weight (grams) *</label>
                <input
                  name="weight"
                  type="number"
                  value={form.weight}
                  onChange={handleChange}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="Enter weight in grams"
                />
              </div>

              <div className="field-group">
                <label>Purity *</label>
                <select name="purity" value={form.purity} onChange={handleChange} required>
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

              <div className="field-group full-span">
                <label>
                  Product Image * <span className="required-note">(Required)</span>
                </label>

                <div className={`upload-box ${form.image ? "selected" : ""}`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden-input"
                    onChange={handleImageChange}
                  />

                  <button
                    type="button"
                    className="product-pill-btn upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.image ? "Change Image" : "Choose Image"}
                  </button>

                  {form.image ? (
                    <p className="upload-hint success">Selected: {form.image.name}</p>
                  ) : (
                    <p className="upload-hint">Please select an image for the product</p>
                  )}

                  {previewUrl && (
                    <div className="preview-wrap">
                      <img src={previewUrl} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flags-wrap">
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured Product
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={form.isTrending}
                  onChange={handleChange}
                />
                Trending Product
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={form.isRecommended}
                  onChange={handleChange}
                />
                Recommended Product
              </label>
            </div>

            <div className="add-product-actions">
              <Link to="/admin/products" className="action-link">
                <button type="button" className="product-pill-btn">
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className={submitting ? "product-pill-btn submit-btn button-loading" : "product-pill-btn submit-btn"}
              >
                {submitting ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AddProduct;
