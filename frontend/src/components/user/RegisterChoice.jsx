import { Link } from "react-router-dom";
import styles from "./RegisterChoice.module.css";

function RegisterChoice() {
  return (
    <div className={styles.choiceContainer}>
      <h2 className={styles.title}>Выберите тип регистрации</h2>
      <div className={styles.choices}>
        <Link to="/register/candidate" className={styles.choiceBtn}>
          Кандидат
        </Link>
        <Link to="/register/employer" className={styles.choiceBtn} style={{ background: "#6c757d" }}>
          Работодатель
        </Link>
      </div>
      <p style={{ textAlign: "center", marginTop: 20 }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: "#007bff" }}>Войти</Link>
      </p>
    </div>
  );
}
export default RegisterChoice;