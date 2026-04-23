import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminAPI from "../../services/adminApi";
import { METAL_TYPES, OCCASION_TYPES, PRODUCT_CATEGORIES } from "../../constants/productOptions";
import { getProductImageSrc, handleProductImageError } from "../../utils/imageUrl";
import "./EditProduct.css";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    metal: "",
    occasion: "",
    image: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await adminAPI.get(`/products`);
        const product = res.data.find((p) => p._id === id);

        if (!product) {
          navigate("/admin/products", { replace: true });
          return;
        }

        setForm({
          name: product.name || "",
          price: product.price || "",
          category: product.category || "",
          metal: product.metal || "",
          occasion: product.occasion || "",
          image: null,
        });

        setCurrentImage(product.image || "");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (currentImage) return getProductImageSrc(currentImage);
    return "";
  }, [form.image, currentImage]);

  useEffect(() => {
    return () => {
      if (form.image && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.image, previewUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const data = new FormData();
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("category", form.category);
    data.append("metal", form.metal);
    data.append("occasion", form.occasion);
    if (form.image) data.append("image", form.image);

    const token = sessionStorage.getItem("adminToken");

    try {
      setSubmitting(true);
      await adminAPI.put(`/admin/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/admin/products", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading product details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="edit-product-shell">
        <nav className="edit-product-breadcrumb">
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
          <span>Edit</span>
        </nav>

        <header className="edit-product-header">
          <p className="edit-product-kicker">PARIVA Catalog Studio</p>
          <h1>Edit Product</h1>
          <p>Update details and keep your product listing fresh.</p>
        </header>

        <section className="edit-product-card">
          <form onSubmit={handleSubmit}>
            <div className="edit-product-grid">
              <div className="field-group">
                <label>Product Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  required
                />
              </div>

              <div className="field-group">
                <label>Price (Rs) *</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  placeholder="Price"
                  required
                />
              </div>

              <div className="field-group">
                <label>Category *</label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  list="edit-product-category-options"
                  placeholder="Select or type category"
                  required
                />
                <datalist id="edit-product-category-options">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="field-group">
                <label>Metal *</label>
                <input
                  name="metal"
                  value={form.metal}
                  onChange={handleChange}
                  list="edit-product-metal-options"
                  placeholder="Select or type metal"
                  required
                />
                <datalist id="edit-product-metal-options">
                  {METAL_TYPES.map((metal) => (
                    <option key={metal} value={metal} />
                  ))}
                </datalist>
              </div>

              <div className="field-group full-span">
                <label>Occasion *</label>
                <input
                  name="occasion"
                  value={form.occasion}
                  onChange={handleChange}
                  list="edit-product-occasion-options"
                  placeholder="Select or type occasion"
                  required
                />
                <datalist id="edit-product-occasion-options">
                  {OCCASION_TYPES.map((occasion) => (
                    <option key={occasion} value={occasion} />
                  ))}
                </datalist>
              </div>

              <div className="field-group full-span">
                <label>Product Image (optional)</label>
                <div className="ui-file-field">
                  <label className={`ui-file-shell ${form.image ? "has-file" : ""}`}>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="ui-file-input"
                      ref={fileInputRef}
                      onChange={handleChange}
                    />
                    <span className="ui-file-trigger">
                      {form.image ? "Change Image" : currentImage ? "Replace Image" : "Choose Image"}
                    </span>
                    <span className="ui-file-copy">
                      <span className="ui-file-name">
                        {form.image?.name || currentImage || "No new image selected"}
                      </span>
                      <span className="ui-file-caption">
                        {currentImage && !form.image
                          ? "Current product image will stay until you choose a replacement."
                          : "Upload a product image if you want to update it."}
                      </span>
                    </span>
                  </label>
                </div>

                {previewUrl ? (
                  <div className="preview-wrap">
                    <img src={previewUrl} alt="Product preview" onError={handleProductImageError} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="edit-product-actions">
              <button
                type="button"
                className="product-pill-btn"
                onClick={() => navigate("/admin/products", { replace: true })}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={submitting ? "product-pill-btn submit-btn button-loading" : "product-pill-btn submit-btn"}
              >
                {submitting ? "Updating..." : "Update Product"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default EditProduct;
