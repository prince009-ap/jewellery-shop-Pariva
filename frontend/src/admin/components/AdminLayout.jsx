import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
