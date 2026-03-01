/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import adminAPI from "../services/adminApi";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "flat",
    discountValue: "",
    minOrderValue: "",
    expiryDate: "",
  });

  // 🔹 SINGLE SOURCE OF TRUTH
  const loadCoupons = async () => {
    try {
      const res = await adminAPI.get("/admin/coupons");
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to load coupons", err);
    }
  };

  // ✅ ESLint-safe useEffect
  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createCoupon = async () => {
    if (!form.code || !form.discountValue || !form.expiryDate) {
      alert("Required fields missing");
      return;
    }

    await adminAPI.post("/admin/coupons", {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderValue: Number(form.minOrderValue || 0),
    });

    alert("Coupon created");

    setForm({
      code: "",
      discountType: "flat",
      discountValue: "",
      minOrderValue: "",
      expiryDate: "",
    });

    loadCoupons(); // ✅ defined
  };

  const toggleStatus = async (id) => {
    await adminAPI.patch(`/admin/coupons/${id}/toggle`);
    loadCoupons(); // ✅ defined
  };


  return (
    <div style={{ padding: 30 }}>
      <h2>Coupon Management</h2>

      {/* CREATE COUPON */}
      <div style={{ marginBottom: 30 }}>
        <input name="code" placeholder="Coupon Code" value={form.code} onChange={handleChange} />
        <select name="discountType" value={form.discountType} onChange={handleChange}>
          <option value="flat">Flat ₹</option>
          <option value="percent">Percentage %</option>
        </select>
        <input name="discountValue" placeholder="Discount Value" value={form.discountValue} onChange={handleChange} />
        <input name="minOrderValue" placeholder="Min Order Value" value={form.minOrderValue} onChange={handleChange} />
        <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
        <button onClick={createCoupon}>Create Coupon</button>
      </div>

      {/* COUPON LIST */}
      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Min Order</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Action</th>

          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id}>
              <td>{c.code}</td>
              <td>{c.discountType}</td>
              <td>{c.discountValue}</td>
              <td>₹{c.minOrderValue}</td>
              <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
              <td>
  <span
    style={{
      color: c.isActive ? "green" : "red",
      fontWeight: "bold",
    }}
  >
    {c.isActive ? "Active" : "Disabled"}
  </span>
</td>

<td>
  <button
    onClick={() => toggleStatus(c._id)}
    style={{
      background: c.isActive ? "#c62828" : "#2e7d32",
      color: "#fff",
      border: "none",
      padding: "5px 10px",
      cursor: "pointer",
    }}
  >
    {c.isActive ? "Disable" : "Enable"}
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCoupons;
