import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SelectDropdown from "../../components/common/SelectDropdown";
import adminAPI from "../../services/adminApi";
import "./ProductList.css";

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await adminAPI.get("/products");
        setProducts(res.data);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const deleteHandler = async (id) => {
    setDeleteLoading(true);
    const token = sessionStorage.getItem("adminToken");
    await adminAPI.delete(`/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setDeleteLoading(false);
    setPendingDelete(null);
  };

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "oldest":
        arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case "name_asc":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "price_low":
        arr.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case "price_high":
        arr.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "metal_asc":
        arr.sort((a, b) => (a.metal || "").localeCompare(b.metal || ""));
        break;
      case "metal_desc":
        arr.sort((a, b) => (b.metal || "").localeCompare(a.metal || ""));
        break;
      case "latest":
      default:
        arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    return arr;
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="product-list-shell">
        <nav className="product-breadcrumb">
          <button
            type="button"
            className="crumb-home-btn"
            onClick={() => navigate("/admin/dashboard", { replace: true })}
          >
            Home
          </button>
          <span>&gt;</span>
          <span>Products</span>
        </nav>

        <header className="product-list-header">
          <div>
            <p className="product-kicker">PARIVA Catalog Control</p>
            <h1>Manage Products</h1>
            <p>View, edit, and maintain your entire product catalog.</p>
          </div>

          <Link to="/admin/products/add" className="product-add-link">
            <button className="product-pill-btn add-btn">Add New Product</button>
          </Link>
        </header>

        <section className="product-table-card">
          <div className="product-table-topbar">
            <div className="table-count">Total Products: {products.length}</div>
            <div className="sort-wrap">
              <label htmlFor="product-sort">Sort By</label>
              <SelectDropdown
                id="product-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: "latest", label: "Latest Added" },
                  { value: "oldest", label: "Oldest Added" },
                  { value: "name_asc", label: "Name A-Z" },
                  { value: "name_desc", label: "Name Z-A" },
                  { value: "price_low", label: "Price Low-High" },
                  { value: "price_high", label: "Price High-Low" },
                  { value: "metal_asc", label: "Metal A-Z" },
                  { value: "metal_desc", label: "Metal Z-A" },
                ]}
              />
            </div>
          </div>
          <div className="product-table-wrap">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Metal</th>
                  <th>Occasion</th>
                  <th>Price</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.map((p) => (
                  <tr key={p._id}>
                    <td data-label="Image">
                      <div className="product-thumb-wrap">
                        <img
                          src={`http://localhost:5000/uploads/${p.image}`}
                          alt={p.name}
                          className="product-thumb"
                        />
                      </div>
                    </td>

                    <td className="product-name-cell" data-label="Name">{p.name}</td>
                    <td data-label="Category">{p.category}</td>
                    <td data-label="Metal">{p.metal}</td>
                    <td data-label="Occasion">{p.occasion}</td>
                    <td data-label="Price">Rs {p.price}</td>
                    <td data-label="Added On">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td data-label="Actions">
                      <div className="product-actions-cell">
                        <Link to={`/admin/products/edit/${p._id}`}>
                          <button className="product-pill-btn edit-btn">Edit</button>
                        </Link>
                        <button
                          className="product-pill-btn delete-btn"
                          onClick={() => setPendingDelete(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {pendingDelete && (
        <div className="product-modal-backdrop" role="dialog" aria-modal="true">
          <div className="product-modal-card">
            <p className="product-modal-kicker">Confirm Action</p>
            <h3>Delete this product?</h3>
            <p>
              This will permanently remove <strong>{pendingDelete.name}</strong> from
              your catalog.
            </p>

            <div className="product-modal-actions">
              <button
                type="button"
                className="product-pill-btn modal-cancel-btn"
                onClick={() => setPendingDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="product-pill-btn modal-delete-btn"
                onClick={() => deleteHandler(pendingDelete._id)}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;
