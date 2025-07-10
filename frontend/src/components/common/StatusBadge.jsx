import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, children }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>{children}</span>
  );
}