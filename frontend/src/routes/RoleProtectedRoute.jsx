import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const validateToken = async () => {
        try {
          await api.get('/user/profile');
          setUserInfo({ role: userRole });
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            setUserInfo(null);
          } else {
            setUserInfo({ role: userRole });
          }
        } finally {
          setLoading(false);
        }
      };
      validateToken();
    } catch (err) {
      setUserInfo(null);
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div>Проверка авторизации...</div>;
  }
  if (!token || !userInfo) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/" />;
  }
  return children;
}
export default RoleProtectedRoute;