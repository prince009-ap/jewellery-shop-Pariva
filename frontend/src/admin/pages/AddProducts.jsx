import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import {
  METAL_TYPES,
  OCCASION_TYPES,
  PRODUCT_CATEGORIES,
  PURITY_OPTIONS,
} from "../../constants/productOptions";
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

    if (!form.name || !form.price || !form.category || !form.metal || !form.occasion || !form.sku || !form.weight || !form.purity) {
      alert("Please fill all required product details");
      return;
    }

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
                <SelectDropdown
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  options={PRODUCT_CATEGORIES}
                  placeholder="Select or type category"
                  searchable
                />
              </div>

              <div className="field-group">
                <label>Metal Type *</label>
                <SelectDropdown
                  name="metal"
                  value={form.metal}
                  onChange={handleChange}
                  options={METAL_TYPES}
                  placeholder="Select metal"
                />
              </div>

              <div className="field-group">
                <label>Occasion *</label>
                <SelectDropdown
                  name="occasion"
                  value={form.occasion}
                  onChange={handleChange}
                  options={OCCASION_TYPES}
                  placeholder="Select occasion"
                />
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
                <SelectDropdown
                  name="purity"
                  value={form.purity}
                  onChange={handleChange}
                  options={PURITY_OPTIONS}
                  placeholder="Select purity"
                />
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
