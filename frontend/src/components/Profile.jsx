import { useEffect, useState } from "react";
import { userAPI } from "../services/api";
import styles from "../styles/Card.module.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setProfile(res.data);
      } catch (err) {
        setError("Ошибка загрузки профиля");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Загрузка...</div></div>;
  if (error) return <div className={styles.container}><div style={{ color: "#dc3545", textAlign: "center" }}>{error}</div></div>;
  if (!profile) return <div className={styles.container}><div className={styles.emptyState}>Профиль не найден</div></div>;

  return (
    <div className={styles.container}>
      <h2>Профиль</h2>
      <div className={styles.card}>
        <p><b>Email:</b> {profile.email}</p>
        <p><b>Имя:</b> {profile.name}</p>
        <p><b>Телефон:</b> {profile.phone}</p>
        <p><b>Резюме:</b> {profile.resume}</p>
        <p><b>Роль:</b> {profile.role === 0 ? 'Соискатель' : 'Работодатель'}</p>
      </div>
    </div>
  );
}
export default Profile;