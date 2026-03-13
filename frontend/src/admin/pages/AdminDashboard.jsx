import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import adminAPI from "../../services/adminApi";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    adminAPI
      .get("/admin/dashboard/analytics")
      .then((res) => {
        setAnalytics(res.data);
      })
      .catch((err) => {
        console.error("Analytics error:", err);
      });
  }, []);

  useEffect(() => {
    adminAPI
      .get("/admin/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Dashboard error", err));
  }, []);

  if (!stats) {
    return (
      <div className="page-loading-overlay">
        <div className="page-loading-content">
          <div className="loading-spinner loading-spinner-large"></div>
          <div className="page-loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const statItems = [
    { title: "Total Products", value: stats.totalProducts },
    { title: "Total Orders", value: stats.totalOrders },
    { title: "Total Users", value: stats.totalUsers },
    { title: "Today's Revenue", value: `Rs ${(stats.todayRevenue || 0).toLocaleString("en-IN")}` },
    { title: "New Users Today", value: stats.todayUsers },
    { title: "New Products Today", value: stats.todayProducts },
    { title: "Users (Last 7 Days)", value: stats.last7DaysUsers },
    { title: "Products (Last 7 Days)", value: stats.last7DaysProducts },
    { title: "Total Coupons", value: stats.totalCoupons },
    { title: "Total Revenue", value: `Rs ${(stats.totalRevenue || 0).toLocaleString("en-IN")}` },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <div>
            <p className="admin-dashboard-kicker">PARIVA Control Center</p>
            <h1>Admin Dashboard</h1>
            <p className="admin-dashboard-subtitle">
              Overview of growth, stock, orders, and operational actions.
            </p>
          </div>
        </header>

        <section className="dashboard-grid">
          {statItems.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} />
          ))}
        </section>

        <section className="admin-panel-card">
          <div className="panel-head">
            <h3>Recent Products</h3>
          </div>

          <div className="table-wrap">
            <table className="recent-products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentProducts || []).map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>Rs {p.price}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {stats.lowStockProducts.length > 0 && (
          <section className="admin-panel-card stock-alert-card">
            <h3>Low Stock Alert</h3>
            <ul>
              {stats.lowStockProducts.map((p) => (
                <li key={p._id}>
                  <strong>{p.name}</strong> - only {p.stock} units remaining
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="admin-panel-card">
          <div className="panel-head">
            <h3>Platform Growth (Last 7 Days)</h3>
          </div>

          {analytics.length === 0 ? (
            <div className="empty-state">
              <p>
                No analytics data available yet. Add some products and users to
                see the growth chart.
              </p>
            </div>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6deeb" />
                  <XAxis dataKey="date" stroke="#62738f" />
                  <YAxis stroke="#62738f" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #d6deeb",
                    }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#0ea5a0" strokeWidth={3} />
                  <Line
                    type="monotone"
                    dataKey="products"
                    stroke="#d4a226"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="dashboard-card">
      <p className="card-title">{title}</p>
      <h3 className="card-value">{value}</h3>
    </div>
  );
}

export default AdminDashboard;
