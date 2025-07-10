import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Header({ isAuth, onLogout }) {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (isAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
        } catch (err) {
          console.error('Failed to parse token', err);
        }
      }
    } else {
      setUserRole(null);
    }
  }, [isAuth]);

  return (
    <header style={{ 
      padding: "10px 20px", 
      borderBottom: "1px solid #ccc", 
      marginBottom: 20,
      backgroundColor: "#f8f9fa"
    }}>
      <nav style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <Link to="/" style={{ textDecoration: "none", fontWeight: "bold" }}>
          Вакансии
        </Link>
        {isAuth ? (
          <>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              Профиль
            </Link>
            
            {userRole === "Candidate" && (
              <Link to="/applications" style={{ textDecoration: "none" }}>
                Мои отклики
              </Link>
            )}
            
            {userRole === "Employer" && (
              <>
                <Link to="/my-vacancies" style={{ textDecoration: "none" }}>
                  Мои вакансии
                </Link>
                <Link to="/applications" style={{ textDecoration: "none" }}>
                  Отклики на вакансии
                </Link>
              </>
            )}
            
            <button 
              onClick={onLogout}
              style={{
                marginLeft: "auto",
                padding: "5px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer"
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none" }}>
              Вход
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;