import styles from './Header.module.css';

export default function Header({ isAuth, onLogout }) {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>Logo</span>
      <nav className={styles.navLinks}>
        {/* ссылки на страницы */}
      </nav>
      {isAuth && (
        <div className={styles.user}>
          <button className={styles.logoutBtn} onClick={onLogout}>Выйти</button>
        </div>
      )}
    </header>
  );
}