import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
              <select
                id="product-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest Added</option>
                <option value="oldest">Oldest Added</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="price_low">Price Low-High</option>
                <option value="price_high">Price High-Low</option>
                <option value="metal_asc">Metal A-Z</option>
                <option value="metal_desc">Metal Z-A</option>
              </select>
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
                    <td>
                      <div className="product-thumb-wrap">
                        <img
                          src={`http://localhost:5000/uploads/${p.image}`}
                          alt={p.name}
                          className="product-thumb"
                        />
                      </div>
                    </td>

                    <td className="product-name-cell">{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.metal}</td>
                    <td>{p.occasion}</td>
                    <td>Rs {p.price}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td>
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
