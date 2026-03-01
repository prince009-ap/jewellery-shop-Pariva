import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminAPI from "../../services/adminApi";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
     metal: "",        // ✅ ADD
  occasion: "",     // ✅ ADD
    image: null,
  });

  useEffect(() => {
    const loadProduct = async () => {
      const res = await adminAPI.get(`/products`);
      const product = res.data.find((p) => p._id === id);

      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
          metal: product.metal,          // ✅ ADD
  occasion: product.occasion,    // ✅ ADD
        image: null,
      });
    };

    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("category", form.category);
    data.append("metal", form.metal);        // ✅ ADD
data.append("occasion", form.occasion);  // ✅ ADD
    if (form.image) data.append("image", form.image);

    const token = localStorage.getItem("adminToken");

    await adminAPI.put(`/admin/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    navigate("/admin/dashboard");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px" }}>
      <h2>Edit Product</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
        />

        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          required
        />

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          required
        />
        <input
  name="metal"
  value={form.metal}
  onChange={handleChange}
  placeholder="Metal (Gold / Silver)"
  required
/>

<input
  name="occasion"
  value={form.occasion}
  onChange={handleChange}
  placeholder="Occasion (Wedding / Daily)"
  required
/>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Update Product</button>
      </form>
    </div>
  );
}

export default EditProduct;
