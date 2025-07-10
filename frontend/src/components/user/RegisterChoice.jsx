import { Link } from "react-router-dom";
import styles from "../styles/Card.module.css";

function RegisterChoice() {
  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h2>Выберите тип регистрации</h2>
        <p style={{ textAlign: "center", marginBottom: "30px", color: "#666" }}>
          Выберите, кем вы хотите зарегистрироваться на платформе
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Link
            to="/register/candidate"
            style={{
              display: "block",
              padding: "20px",
              backgroundColor: "#e8f4fd",
              border: "2px solid #007bff",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#007bff",
              textAlign: "center",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#d1ecf1"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#e8f4fd"}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>Кандидат</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Ищу работу и хочу откликаться на вакансии
            </p>
          </Link>
          
          <Link
            to="/register/employer"
            style={{
              display: "block",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              border: "2px solid #6c757d",
              borderRadius: "8px",
              textDecoration: "none",
              color: "#6c757d",
              textAlign: "center",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#e9ecef"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#f8f9fa"}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>Работодатель</h3>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Размещаю вакансии и ищу сотрудников
            </p>
          </Link>
        </div>
        
        <p style={{ textAlign: "center", marginTop: "30px" }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: "#007bff" }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterChoice;