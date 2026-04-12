import { useEffect, useRef, useState } from "react";
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
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth
  );
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const [activeRecentIndex, setActiveRecentIndex] = useState(0);
  const statsRailRef = useRef(null);
  const recentRailRef = useRef(null);

  const isTabletOrLess = viewportWidth < 1024;
  const isCompact = viewportWidth < 768;

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

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const updateActiveSlide = (container, setter) => {
    if (!container) return;

    const children = Array.from(container.children);
    if (!children.length) return;

    const containerLeft = container.getBoundingClientRect().left;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    children.forEach((child, index) => {
      const distance = Math.abs(child.getBoundingClientRect().left - containerLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setter(closestIndex);
  };

  const formatAnalyticsTick = (value) => {
    if (!isTabletOrLess) return value;

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return String(value).slice(-5);
    }

    return `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}`;
  };

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
  const recentProducts = stats.recentProducts || [];

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

        <section
          ref={statsRailRef}
          className={`dashboard-grid ${isTabletOrLess ? "dashboard-grid-mobile" : ""}`}
          onScroll={() => updateActiveSlide(statsRailRef.current, setActiveStatIndex)}
        >
          {statItems.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} onClick={item.onClick} />
          ))}
        </section>

        {isTabletOrLess ? (
          <div className="dashboard-mobile-dots" aria-label="Dashboard card position">
            {statItems.map((item, index) => (
              <span
                key={item.title}
                className={`dashboard-mobile-dot ${index === activeStatIndex ? "active" : ""}`}
              />
            ))}
          </div>
        ) : null}

        <section className="admin-panel-card">
          <div className="panel-head">
            <h3>Recent Products</h3>
          </div>

          <div className="table-wrap recent-products-desktop">
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
                    <td data-label="Name">{p.name}</td>
                    <td data-label="Category">{p.category}</td>
                    <td data-label="Price">Rs {p.price}</td>
                    <td data-label="Added On">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isTabletOrLess ? (
            <>
              <div
                ref={recentRailRef}
                className="recent-products-mobile-rail"
                onScroll={() => updateActiveSlide(recentRailRef.current, setActiveRecentIndex)}
              >
                {recentProducts.map((product) => (
                  <article key={product._id} className="recent-product-mobile-card">
                    <div className="recent-product-mobile-field">
                      <span>Name</span>
                      <strong>{product.name}</strong>
                    </div>
                    <div className="recent-product-mobile-field">
                      <span>Category</span>
                      <strong>{product.category}</strong>
                    </div>
                    <div className="recent-product-mobile-field">
                      <span>Price</span>
                      <strong>Rs {product.price}</strong>
                    </div>
                    <div className="recent-product-mobile-field">
                      <span>Added On</span>
                      <strong>
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>

              {recentProducts.length > 1 ? (
                <div className="dashboard-mobile-dots" aria-label="Recent product position">
                  {recentProducts.map((product, index) => (
                    <span
                      key={product._id}
                      className={`dashboard-mobile-dot ${index === activeRecentIndex ? "active" : ""}`}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics}
                  margin={{
                    top: 10,
                    right: isCompact ? 8 : 16,
                    left: isCompact ? 0 : 4,
                    bottom: isCompact ? 12 : 8,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6deeb" />
                  <XAxis
                    dataKey="date"
                    stroke="#62738f"
                    tick={{ fontSize: isCompact ? 11 : 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={isCompact ? 24 : 18}
                    interval="preserveStartEnd"
                    tickFormatter={formatAnalyticsTick}
                  />
                  <YAxis
                    stroke="#62738f"
                    width={isCompact ? 28 : 36}
                    tick={{ fontSize: isCompact ? 11 : 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #d6deeb",
                    }}
                    labelFormatter={(value) => `Date: ${value}`}
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
