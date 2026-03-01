import { useEffect, useState } from "react";
import adminAPI from "../../services/adminApi";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";



function AdminDashboard() {
  const navigate = useNavigate();
const { setAdmin } = useAdminAuth();

  const [stats, setStats] = useState(null);
const [gold, setGold] = useState("");
const [silver, setSilver] = useState("");
const [ratesLoading, setRatesLoading] = useState(false);
const handleLogout = () => {
  localStorage.removeItem("adminToken");
  setAdmin(null);
  navigate("/admin/login", { replace: true });
};

const updateRates = async () => {
  if (ratesLoading) return;
  
  try {
    setRatesLoading(true);
    await adminAPI.post("/admin/metal-rates", {
      goldRate: gold,
      silverRate: silver,
    });
    alert("Rates updated & product prices recalculated");
  } catch (err) {
    alert("Rate update failed " , err);
  } finally {
    setRatesLoading(false);
  }
};
const [analytics, setAnalytics] = useState([]);

useEffect(() => {
  adminAPI.get("/admin/dashboard/analytics")
    .then(res => {
      console.log("Analytics data:", res.data);
      setAnalytics(res.data);
    })
    .catch(err => {
      console.error("Analytics error:", err);
    });
}, []);
  useEffect(() => {
    adminAPI
      .get("/admin/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Dashboard error", err));
  }, []);

  if (!stats) return (
    <div className="page-loading-overlay">
      <div className="page-loading-content">
        <div className="loading-spinner loading-spinner-large"></div>
        <div className="page-loading-text">Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard" style={{ padding: "2rem" }}>
      <h2>Admin Dashboard</h2>

      {/* 🔥 STATS CARDS - HORIZONTAL GRID LAYOUT */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Today's Revenue" value={`₹${stats.todayRevenue}`} />
        <StatCard title="New Users Today" value={stats.todayUsers} />
        <StatCard title="New Products Today" value={stats.todayProducts} />
        <StatCard title="Users (Last 7 Days)" value={stats.last7DaysUsers} />
        <StatCard title="Products (Last 7 Days)" value={stats.last7DaysProducts} />
        <StatCard title="Total Coupons" value={stats.totalCoupons} />
        <StatCard title="Active Coupons" value={stats.activeCoupons} />
        <Link to="/admin/couples">
          <div className="dashboard-card" style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #fbbf24',
            color: 'white'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <div className="card-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💑</div>
            <p className="card-title" style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>Couple Products</p>
            <p className="card-description" style={{ margin: '0', color: '#78350f', fontSize: '0.875rem' }}>
              Create and manage couple jewellery products
            </p>
          </div>
        </Link>
      </div>

      

      {/* QUICK ACTIONS */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Link to="/admin/banners">
          <button>Manage Home Banners</button>
          </Link>

        <Link to="/admin/products">
          <button>Manage Products</button>
        </Link>

        <Link to="/admin/orders">
          <button>View Orders</button>
        </Link>

        <Link to="/admin/users">
          <button>View Users</button>
        </Link>

        <Link to="/admin/custom-design">
          <button style={{ background: "#111", color: "#fff" }}>
            Custom Design Requests
          </button>
        </Link>

        <Link to="/admin/coupons">
  <button style={{ background: "#222", color: "#fff" }}>
    Manage Coupons
  </button>
</Link>

      </div>
{/* 🔥 RECENT PRODUCTS TABLE */}
<div style={{ marginTop: "3rem" }}>
  <h3>Recent Products</h3>

  <table
    style={{
      width: "100%",
      marginTop: "1rem",
      borderCollapse: "collapse",
    }}
  >
    <thead>
      <tr style={{ background: "#f5f5f5" }}>
        <th>Name</th>
        <th>Category</th>
        <th>Price</th>
        <th>Added On</th>
      </tr>
    </thead>

    <tbody>
      {stats.recentProducts.map((p) => (
        <tr key={p._id}>
          <td>{p.name}</td>
          <td>{p.category}</td>
          <td>₹{p.price}</td>
          <td>
  {p.createdAt 
    ? new Date(p.createdAt).toLocaleDateString() 
    : "N/A"
  }
</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {/* ⚠️ LOW STOCK ALERT */}
{stats.lowStockProducts.length > 0 && (
  <div style={{ 
    marginTop: "3rem", 
    padding: "1.5rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px"
  }}>
    <h3 style={{ 
      margin: "0 0 1rem 0", 
      color: "#dc2626",
      fontSize: "1.125rem",
      fontWeight: "600"
    }}>
      ⚠️ Low Stock Alert
    </h3>

    <ul style={{ 
      margin: 0, 
      paddingLeft: "1.5rem",
      color: "#991b1b"
    }}>
      {stats.lowStockProducts.map((p) => (
        <li key={p._id} style={{ marginBottom: "0.5rem" }}>
          <strong>{p.name}</strong> – Only {p.stock} units remaining
        </li>
      ))}
    </ul>
  </div>
)}
<div style={{ marginTop: "3rem" }}>
  <h3>Update Metal Rates</h3>

  <input
    placeholder="Gold Rate (₹/gm)"
    value={gold}
    onChange={(e) => setGold(e.target.value)}
    disabled={ratesLoading}
  />

  <input
    placeholder="Silver Rate (₹/gm)"
    value={silver}
    onChange={(e) => setSilver(e.target.value)}
    disabled={ratesLoading}
  />

  <button 
    onClick={updateRates}
    disabled={ratesLoading}
    className={ratesLoading ? 'button-loading' : ''}
    style={{ 
      opacity: ratesLoading ? 0.7 : 1,
      cursor: ratesLoading ? 'not-allowed' : 'pointer'
    }}
  >
    {ratesLoading ? (
      <span className="button-loading-content">
        <span className="loading-spinner-small"></span>
        Updating...
      </span>
    ) : (
      'Update Rates'
    )}
  </button>
</div>
<div style={{ marginTop: "3rem" }}>
  <h3>Platform Growth (Last 7 Days)</h3>
  
  {console.log("Current analytics state:", analytics)}
  
  {analytics.length === 0 ? (
    <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
      <p>No analytics data available yet. Add some products and users to see the growth chart.</p>
    </div>
  ) : (
    <LineChart width={700} height={300} data={analytics}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="users" stroke="#8884d8" />
      <Line type="monotone" dataKey="products" stroke="#82ca9d" />
    </LineChart>
  )}
</div>
<button
    onClick={handleLogout}
    style={{
      background: "#111",
      color: "#fff",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Logout
  </button>
    </div>
    
  );
}

function StatCard({ title, value }) {
  return (
    <div className="dashboard-card" style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}>
      <p className="card-title" style={{
        margin: '0 0 0.5rem 0',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>{title}</p>
      <h3 className="card-value" style={{
        margin: '0',
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#111827',
        lineHeight: '1.2'
      }}>{value}</h3>
    </div>
  );
}

export default AdminDashboard;
