import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const getAgeInDays = (dateValue) =>
    Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24)));

  const statItems = [
    { title: "Total Products", value: stats.totalProducts, onClick: () => navigate("/admin/products") },
    { title: "Total Orders", value: stats.totalOrders, onClick: () => navigate("/admin/orders") },
    { title: "Total Users", value: stats.totalUsers, onClick: () => navigate("/admin/users") },
    {
      title: "Overdue Orders",
      value: stats.overdueOrdersCount || 0,
      onClick: () => navigate("/admin/orders?sort=overdue"),
    },
    {
      title: "Delayed Shipments",
      value: stats.delayedShippedOrdersCount || 0,
      onClick: () => navigate("/admin/orders?sort=delayed_shipped"),
    },
    {
      title: "Today's Revenue",
      value: `Rs ${(stats.todayRevenue || 0).toLocaleString("en-IN")}`,
      onClick: () => navigate("/admin/orders"),
    },
    { title: "New Users Today", value: stats.todayUsers, onClick: () => navigate("/admin/users") },
    { title: "New Products Today", value: stats.todayProducts, onClick: () => navigate("/admin/products") },
    { title: "Users (Last 7 Days)", value: stats.last7DaysUsers, onClick: () => navigate("/admin/users") },
    { title: "Products (Last 7 Days)", value: stats.last7DaysProducts, onClick: () => navigate("/admin/products") },
    { title: "Total Coupons", value: stats.totalCoupons, onClick: () => navigate("/admin/coupons") },
    {
      title: "Total Revenue",
      value: `Rs ${(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      onClick: () => navigate("/admin/orders"),
    },
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
            <StatCard key={item.title} title={item.title} value={item.value} onClick={item.onClick} />
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

        {stats.overdueOrdersCount > 0 && (
          <section className="admin-panel-card overdue-orders-card">
            <h3>Overdue Orders</h3>
            <p className="overdue-orders-copy">
              Orders older than 7 days that are still pending or confirmed need admin action.
            </p>
            <div className="overdue-orders-list">
              {(stats.overdueOrders || []).map((order) => {
                const orderAgeDays = Math.max(
                  0,
                  Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <button
                    key={order._id}
                    type="button"
                    className="overdue-order-item"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <div>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                      <p>{order.user?.name || "Customer"} | {order.orderStatus}</p>
                    </div>
                    <div className="overdue-order-meta">
                      <span>{orderAgeDays} days old</span>
                      <strong>Rs {Number(order.priceBreakup?.totalAmount || 0).toLocaleString("en-IN")}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {stats.delayedShippedOrdersCount > 0 && (
          <section className="admin-panel-card delayed-shipments-card">
            <h3>Shipped But Not Delivered</h3>
            <p className="overdue-orders-copy">
              These orders were shipped days ago but are still not marked delivered.
            </p>
            <div className="overdue-orders-list">
              {(stats.delayedShippedOrders || []).map((order) => {
                const referenceDate = order.shipmentTracking?.lastUpdatedAt || order.updatedAt || order.createdAt;
                const shipmentAgeDays = getAgeInDays(referenceDate);

                return (
                  <button
                    key={order._id}
                    type="button"
                    className="overdue-order-item delayed-shipment-item"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <div>
                      <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                      <p>{order.user?.name || "Customer"} | {order.orderStatus}</p>
                    </div>
                    <div className="overdue-order-meta">
                      <span>{shipmentAgeDays} days since shipped</span>
                      <strong>Rs {Number(order.priceBreakup?.totalAmount || 0).toLocaleString("en-IN")}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
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

function StatCard({ title, value, onClick }) {
  return (
    <button type="button" className="dashboard-card dashboard-card-button" onClick={onClick}>
      <p className="card-title">{title}</p>
      <h3 className="card-value">{value}</h3>
    </button>
  );
}

export default AdminDashboard;
