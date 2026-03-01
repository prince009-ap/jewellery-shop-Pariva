import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== "user") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
