import { useEffect, useState } from "react";
import adminAPI from "../../services/adminApi";
import { Link } from "react-router-dom";

function AdminProduct() {
  const [products, setProducts] = useState([]);


  useEffect(() => {
    const loadProducts = async () => {
      const res = await adminAPI.get("/products");
      setProducts(res.data);
    };
    loadProducts();
  }, []);

  const deleteHandler = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = sessionStorage.getItem("adminToken");
    await adminAPI.delete(`/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };



  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/admin/products/add">
          <button>Add New Product</button>
        </Link>

      </div>

      <table width="100%" border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Metal</th>        {/* ✅ ADD */}
    <th>Occasion</th>     {/* ✅ ADD */}
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                <img
                  src={`http://localhost:5000/uploads/${p.image}`}
                  width="60"
                  alt={p.name}
                />
              </td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.metal}</td>        {/* ✅ ADD */}
<td>{p.occasion}</td>     {/* ✅ ADD */}
              <td>₹{p.price}</td>
              <td>
                <Link to={`/admin/products/edit/${p._id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => deleteHandler(p._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProduct;
