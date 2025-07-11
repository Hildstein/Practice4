import styles from './Header.module.css';
import { Link } from "react-router-dom";

export default function Header({ isAuth, onLogout, userRole }) {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>
        <Link to="/" className={styles.logoLink}>JobBoard</Link>
      </span>
      <nav className={styles.navLinks}>
        <Link to="/" className={styles.link}>Вакансии</Link>
        {isAuth && <Link to="/profile" className={styles.link}>Профиль</Link>}
        {isAuth && <Link to="/applications" className={styles.link}>Отклики</Link>}
        {isAuth && userRole === "Employer" && (
          <Link to="/my-vacancies" className={styles.link}>Мои вакансии</Link>
        )}
        {!isAuth && (
          <>
            <Link to="/login" className={styles.link}>Войти</Link>
            <Link to="/register" className={styles.link}>Регистрация</Link>
          </>
        )}
      </nav>
      {isAuth && (
        <div className={styles.user}>
          <button className={styles.logoutBtn} onClick={onLogout}>Выйти</button>
        </div>
      )}
    </header>
  );
}