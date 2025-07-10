import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

function ProtectedRoute({ children }) {
  const [isValidToken, setIsValidToken] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }
    const validateToken = async () => {
      try {
        await api.get('/user/profile');
        setIsValidToken(true);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      }
    };
    validateToken();
  }, [token]);

  if (!token || isValidToken === false) {
    return <Navigate to="/login" />;
  }
  if (isValidToken === null) {
    return <div>Проверка авторизации...</div>;
  }
  return children;
}
export default ProtectedRoute;