import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

function ProtectedRoute({ children }) {
  const [isValidToken, setIsValidToken] = useState(null);
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }
    
    // Validate token by making a simple authenticated request
    const validateToken = async () => {
      try {
        await api.get('/profile');
        setIsValidToken(true);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setIsValidToken(false);
        } else {
          // Other errors (network, etc.) - assume token is valid for now
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